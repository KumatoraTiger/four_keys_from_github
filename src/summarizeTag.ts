import { Commit, Pr } from "./types";

interface SummarizedTag {
  releaseDate: string | undefined;
  releaseIntervalTime: number;
  numberOfPrs: number;
  commitLeadtimeAverage: number | undefined;
  numberOfHotfixPrs: number;
}

function getPrevReleaseCommit(commits: Commit[]) {
  const mergeTag = commits.find(commit => commit.message.includes("Merge tag"))
  if (mergeTag !== undefined) {
    return mergeTag
  }

  const mergeBranch = commits.find(commit => commit.associatedPullRequests.nodes.length === 0 && commit.parents.totalCount === 1)
  if (mergeBranch !== undefined) {
    return mergeBranch
  }

  return commits.at(0)
}

function calculateIntervalDaysFromStringDate(olderDate: string | undefined, newerDate: string | undefined) {
  if (olderDate === undefined || newerDate === undefined) {
    return NaN
  }

  return (Date.parse(newerDate) - Date.parse(olderDate)) / 1000 / 60 / 60 / 24;
}

function botCreatedPr(pr: Pr) {
  return pr.author?.resourcePath?.includes("bot") || false;
}

function memberCreatedCommits(commits: Commit[]) {
  return commits
          .filter(commit => commit.committer.name !== "GitHub")
          .filter(commit => commit.associatedPullRequests.nodes[0] !== undefined)
          .filter(commit => !botCreatedPr(commit.associatedPullRequests.nodes[0]));
}

function uniquePrs(commits: Commit[]) {
  return memberCreatedCommits(commits)
          .map(commit => commit.associatedPullRequests.nodes[0])
          .filter(pr => pr !== undefined)
          .filter((pr, index, self) => self.findIndex(p => p.number === pr.number) === index);
}

function countNumberOfPrs(commits: Commit[]) {
  return uniquePrs(commits).length
}

function calculateCommitLeadtimeAverage(releaseCommit: Commit | undefined, commits: Commit[]) {
  if (releaseCommit === undefined) {
    return undefined;
  }

  const memberCommits = memberCreatedCommits(commits)
  if (memberCommits.length === 0) {
    return undefined;
  }

  const totalLeadTime = memberCommits.reduce((sum, commit) => sum + calculateIntervalDaysFromStringDate(commit.author.date, releaseCommit.author.date), 0)

  return totalLeadTime / memberCommits.length
}

function countNumberOfHotfixPrs(commits: Commit[]) {
  return uniquePrs(commits)
          .filter(pr => pr.labels.nodes.some((label) => label.name === "hotfix"))
          .length
}

function summarizeTag(commits: Commit[], defaultPrevReleaseCommit: Commit | undefined): SummarizedTag {
  const releaseCommit = commits.at(-1)
  const prevReleaseCommit = defaultPrevReleaseCommit || getPrevReleaseCommit(commits)

  return {
    releaseDate: releaseCommit?.author?.date,
    releaseIntervalTime: calculateIntervalDaysFromStringDate(prevReleaseCommit?.author?.date, releaseCommit?.author?.date),
    numberOfPrs: countNumberOfPrs(commits),
    commitLeadtimeAverage: calculateCommitLeadtimeAverage(releaseCommit, commits),
    numberOfHotfixPrs: countNumberOfHotfixPrs(commits)
  }
}

export { summarizeTag };

