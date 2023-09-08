import { GraphQlQueryResponseData } from "@octokit/graphql";

import { queryGraphQl } from "./queryGraphQl";
import { Tag } from "./types";

interface GraphQlQueryResponseTag {
  name: string;
  target?: {
    abbreviatedOid?: string;
    committedDate?: string;
    target?: {
      abbreviatedOid?: string;
      committedDate?: string;
    }
  }
}

function generateQuery(owner: string, repo: string, cursor: string | null): string {
  return `
  {
    repository(owner: "${owner}", name: "${repo}") {
      refs(
        first: 100
        refPrefix: "refs/tags/"
        after: ${cursor ? `"${cursor}"` : "null"}
      ) {
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          name
          target {
            ... on Commit {
              abbreviatedOid
              committedDate
            }
            ... on Tag {
              target {
                ... on Commit {
                  abbreviatedOid
                  committedDate
                }
              }
            }
          }
        }
      }
    }
  }
  `
}

async function fetchTagsFromGithub(owner: string, repo: string): Promise<GraphQlQueryResponseTag[]> {
  let allTags: any[] = [];
  let cursor = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const resp: GraphQlQueryResponseData = await queryGraphQl(generateQuery(owner, repo, cursor));

    const { pageInfo, nodes: nodes } = resp.repository.refs;

    allTags = allTags.concat(nodes);

    hasNextPage = pageInfo.hasNextPage;
    cursor = pageInfo.endCursor;
  }

  return allTags;
}

function formatGraphQlQueryResponseTag(tag: GraphQlQueryResponseTag): Tag {
  const committedDateString = tag.target?.committedDate || tag.target?.target?.committedDate;
  return {
    name: tag.name,
    commitAbbreviatedOid: tag.target?.abbreviatedOid || tag.target?.target?.abbreviatedOid,
    committedDate: committedDateString ? new Date(committedDateString) : undefined
  }
}

function sortByCommittedDate(tags: Tag[]) {
  return tags.sort((a, b) => {
    if (a.committedDate && b.committedDate) {
      return a.committedDate > b.committedDate ? 1 : -1;
    }

    return 0;
  });
}

function filterAfterDate(tags: Tag[], afterDate: Date) {
  return tags.filter(tag => tag.committedDate === undefined || tag.committedDate > afterDate);
}

async function fetchTags(owner: string, repo: string, fromDate: Date): Promise<Tag[]> {
  const allTags = await fetchTagsFromGithub(owner, repo);
  const tags = allTags.map(tag => formatGraphQlQueryResponseTag(tag));

  return sortByCommittedDate(filterAfterDate(tags, fromDate));
}

export { fetchTags };
