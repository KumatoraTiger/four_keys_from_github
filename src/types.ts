export interface Tag {
  name: string;
  commitAbbreviatedOid?: string;
  committedDate?: string;
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
