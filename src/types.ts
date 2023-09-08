export interface Tag {
  name: string;
  commitAbbreviatedOid?: string;
  committedDate?: Date;
}

export interface Pr {
  number: number;
  title: string;
  author: {
    resourcePath?: string;
  };
  labels: {
    nodes: {
      name: string;
    }[];
  };
}

export interface Commit {
  abbreviatedOid: string;
  message: string;
  author: {
    date: string;
    name: string;
  };
  committer: {
    date: string;
    name: string;
  };
  parents: {
    totalCount: number;
  };
  associatedPullRequests: {
    nodes: Pr[];
  };
}

export interface SummarizedTag {
  release_date: string | undefined;
  number_of_prs: number;
  number_of_hotfix_prs: number;
  number_of_commits: number;
  commit_total_leadtime: number;
}
