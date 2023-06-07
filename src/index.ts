import { parse } from 'csv-parse/sync';
import * as fs from 'fs';

import { fetchCommitsBetweenRefs } from "./fetchCommitsBetweenRefs";
import { fetchTags } from "./fetchTags";
import { summarizeTag } from "./summarizeTag";

async function output(team: string, owner: string, repository: string) {
  const tags = await fetchTags(owner, repository);

  let prevReleaseCommit;
  for (let index = 0; index < tags.length - 1; index++) {
    let prevTag = tags[index];
    let tag = tags[index + 1];
    const commits = await fetchCommitsBetweenRefs(owner, repository, prevTag.name, tag.name);

    const output = summarizeTag(commits, prevReleaseCommit);
    if (output.releaseDate === undefined) {
      continue;
    }
    console.log(`${[
      owner,
      team,
      repository,
      tag.name,
      output.releaseDate,
      output.releaseIntervalTime,
      output.numberOfPrs,
      output.commitLeadtimeAverage,
      output.numberOfHotfixPrs
    ].join(",")}`);
    prevReleaseCommit = commits.at(-1)
  };
}

async function main() {
  const csvInputFilePath = process.argv[2];

  const data = fs.readFileSync(csvInputFilePath);
  const rows = parse(data);

  for (const [owner, team, repository] of rows) {
    await output(team, owner, repository)
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error);
  }
}