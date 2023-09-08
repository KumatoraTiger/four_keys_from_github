import { Commit, Pr, SummarizedTag } from "./types";

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

function formatGitHubDateTimeString(dateTimeString: string | undefined) {
  if (dateTimeString === undefined) {
    return undefined
  }
  return dateTimeString.replace("T", " ");
}

const botNames = process.env.BOT_NAMES?.split(",") || []
function botCreatedPr(pr: Pr) {
  return botNames.some(botName => pr.author?.resourcePath?.includes(botName))
}

function memberCreatedCommits(commits: Commit[]) {
  return commits
          .filter(commit => commit.committer.name !== "GitHub" || commit.message.startsWith("Revert"))
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

function calculateIntervalDaysFromStringDate(olderDate: string | undefined, newerDate: string | undefined) {
  if (olderDate === undefined || newerDate === undefined) {
    return NaN
  }

  return (Date.parse(newerDate) - Date.parse(olderDate)) / 1000 / 60 / 60 / 24;
}

function calculateNumberOfCommitsAndTotalCommitLeadtime(releaseCommit: Commit | undefined, commits: Commit[]): [number, number] {
  if (releaseCommit === undefined) {
    return [0, 0]
  }

  const memberCommits = memberCreatedCommits(commits)

  const totalLeadTime = memberCommits.reduce((sum, commit) => sum + calculateIntervalDaysFromStringDate(commit.author.date, releaseCommit.author.date), 0)

  return [memberCommits.length, totalLeadTime]
}

function countNumberOfHotfixPrs(commits: Commit[]) {
  return uniquePrs(commits)
          .filter(pr => pr.labels.nodes.some((label) => label.name === "hotfix"))
          .length
}

function summarizeTag(commits: Commit[], defaultPrevReleaseCommit: Commit | undefined): SummarizedTag {
  const releaseCommit = commits.at(-1)
  const prevReleaseCommit = defaultPrevReleaseCommit || getPrevReleaseCommit(commits)

  const [numberOfCommits, commitTotalLeadtime] = calculateNumberOfCommitsAndTotalCommitLeadtime(releaseCommit, commits)

  return {
    release_date: formatGitHubDateTimeString(releaseCommit?.author?.date),
    number_of_prs: countNumberOfPrs(commits),
    number_of_hotfix_prs: countNumberOfHotfixPrs(commits),
    number_of_commits: numberOfCommits,
    commit_total_leadtime: commitTotalLeadtime
  }
}

export { summarizeTag };

