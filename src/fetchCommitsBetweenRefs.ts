import { GraphQlQueryResponseData } from "@octokit/graphql";

import { queryGraphQl } from "./queryGraphQl";
import { Commit } from "./types";

function generateQuery(owner: string, repo: string, baseRefName: string, headRefName: string, cursor: string | null): string {
  return `
  {
    repository(owner: "${owner}", name: "${repo}") {
      ref(qualifiedName: "${baseRefName}") {
        compare(headRef: "${headRefName}") {
          commits(first: 100, after: ${cursor ? `"${cursor}"` : "null"}) {
            nodes {
              abbreviatedOid
              message
              author {
                date
                name
              }
              committer {
                date
                name
              }
              parents(first: 10) {
                totalCount
              }
              associatedPullRequests(first: 1) {
                nodes {
                  number
                  title
                  author {
                    resourcePath
                  }
                  labels(first: 10) {
                    nodes {
                      name
                    }
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    }
  }
  `
}

async function fetchCommitsBetweenRefs(owner: string, repo: string, baseRefName: string, headRefName: string): Promise<Commit[]> {
  let allCommits: any[] = [];
  let cursor = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const resp: GraphQlQueryResponseData = await queryGraphQl(generateQuery(owner, repo, baseRefName, headRefName, cursor));

    const { pageInfo, nodes: nodes } = resp.repository.ref.compare.commits;

    nodes.forEach((node: any) => {
      // console.log(node);
      // console.log(node.associatedPullRequests.nodes[0]);
    });
    allCommits = allCommits.concat(nodes);

    hasNextPage = pageInfo.hasNextPage;
    cursor = pageInfo.endCursor;
  }
  // console.log(allCommits)

  return allCommits;
}

export { fetchCommitsBetweenRefs };
