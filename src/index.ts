require('dotenv').config();

import { parse } from 'csv-parse/sync';
import stringifySync from 'csv-stringify/sync';
import * as fs from 'fs';

import { fetchCommitsBetweenRefs } from "./fetchCommitsBetweenRefs";
import { fetchTags } from "./fetchTags";
import { summarizeTag } from "./summarizeTag";

import { SummarizedTag } from './types';

interface RepositoryInfo {
  owner: string;
  team: string;
  repository: string;
  tag_name: string;
}
type Output = RepositoryInfo & SummarizedTag;

async function output(team: string, owner: string, repository: string, fromDate: Date): Promise<Output[]> {
  const tags = await fetchTags(owner, repository, fromDate);

  const outputs: Output[] = [];

  let prevReleaseCommit;
  for (let index = 0; index < tags.length - 1; index++) {
    let prevTag = tags[index];
    let tag = tags[index + 1];
    const commits = await fetchCommitsBetweenRefs(owner, repository, prevTag.name, tag.name);

    const tagInfo = summarizeTag(commits, prevReleaseCommit);
    if (tagInfo.release_date === undefined) {
      continue;
    }

    const output = { owner: owner, team: team, repository: repository, tag_name: tag.name, ...tagInfo };
    outputs.push(output);
    console.log(`${Object.values(output).map(value => String(value)).join(",")}`);

    prevReleaseCommit = commits.at(-1)
  };

  return outputs;
}

async function main() {
  const csvInputFilePath = process.argv[2];
  const fromDate = new Date(process.argv[3]);

  const data = fs.readFileSync(csvInputFilePath);
  const rows = parse(data);

  const results = await Promise.all(rows.map(([owner, team, repository]: [string, string, string]) => {
    return output(team, owner, repository, fromDate);
  }));
 const outputs: Output[] = results.flat();

  const csvString = stringifySync.stringify(outputs, { header: true });
  fs.writeFileSync("./out/output.csv", csvString);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error);
  }
}