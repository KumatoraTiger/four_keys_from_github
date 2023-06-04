"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeTag = void 0;
function getPrevReleaseCommit(commits) {
    const mergeTag = commits.find(commit => commit.message.includes("Merge tag"));
    if (mergeTag !== undefined) {
        return mergeTag;
    }
    const mergeBranch = commits.find(commit => commit.associatedPullRequests.nodes.length === 0 && commit.parents.totalCount === 1);
    if (mergeBranch !== undefined) {
        return mergeBranch;
    }
    return commits.at(0);
}
function calculateIntervalDaysFromStringDate(olderDate, newerDate) {
    if (olderDate === undefined || newerDate === undefined) {
        return NaN;
    }
    return (Date.parse(newerDate) - Date.parse(olderDate)) / 1000 / 60 / 60 / 24;
}
function botCreatedPr(pr) {
    var _a, _b;
    return ((_b = (_a = pr.author) === null || _a === void 0 ? void 0 : _a.resourcePath) === null || _b === void 0 ? void 0 : _b.includes("bot")) || false;
}
function memberCreatedCommits(commits) {
    return commits
        .filter(commit => commit.committer.name !== "GitHub")
        .filter(commit => commit.associatedPullRequests.nodes[0] !== undefined)
        .filter(commit => !botCreatedPr(commit.associatedPullRequests.nodes[0]));
}
function uniquePrs(commits) {
    return memberCreatedCommits(commits)
        .map(commit => commit.associatedPullRequests.nodes[0])
        .filter(pr => pr !== undefined)
        .filter((pr, index, self) => self.findIndex(p => p.number === pr.number) === index);
}
function countNumberOfPrs(commits) {
    return uniquePrs(commits).length;
}
function calculateCommitLeadtimeAverage(releaseCommit, commits) {
    if (releaseCommit === undefined) {
        return undefined;
    }
    const memberCommits = memberCreatedCommits(commits);
    if (memberCommits.length === 0) {
        return undefined;
    }
    const totalLeadTime = memberCommits.reduce((sum, commit) => sum + calculateIntervalDaysFromStringDate(commit.author.date, releaseCommit.author.date), 0);
    return totalLeadTime / memberCommits.length;
}
function countNumberOfHotfixPrs(commits) {
    return uniquePrs(commits)
        .filter(pr => pr.labels.nodes.some((label) => label.name === "hotfix"))
        .length;
}
function summarizeTag(commits, defaultPrevReleaseCommit) {
    var _a, _b, _c;
    const releaseCommit = commits.at(-1);
    const prevReleaseCommit = defaultPrevReleaseCommit || getPrevReleaseCommit(commits);
    return {
        releaseDate: (_a = releaseCommit === null || releaseCommit === void 0 ? void 0 : releaseCommit.author) === null || _a === void 0 ? void 0 : _a.date,
        releaseIntervalTime: calculateIntervalDaysFromStringDate((_b = prevReleaseCommit === null || prevReleaseCommit === void 0 ? void 0 : prevReleaseCommit.author) === null || _b === void 0 ? void 0 : _b.date, (_c = releaseCommit === null || releaseCommit === void 0 ? void 0 : releaseCommit.author) === null || _c === void 0 ? void 0 : _c.date),
        numberOfPrs: countNumberOfPrs(commits),
        commitLeadtimeAverage: calculateCommitLeadtimeAverage(releaseCommit, commits),
        numberOfHotfixPrs: countNumberOfHotfixPrs(commits)
    };
}
exports.summarizeTag = summarizeTag;
