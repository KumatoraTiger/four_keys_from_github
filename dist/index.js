"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const sync_1 = require("csv-parse/sync");
const fs = __importStar(require("fs"));
const fetchCommitsBetweenRefs_1 = require("./fetchCommitsBetweenRefs");
const fetchTags_1 = require("./fetchTags");
const summarizeTag_1 = require("./summarizeTag");
function output(team, owner, repository) {
    return __awaiter(this, void 0, void 0, function* () {
        const tags = yield (0, fetchTags_1.fetchTags)(owner, repository);
        let prevReleaseCommit;
        for (let index = 0; index < tags.length - 1; index++) {
            let prevTag = tags[index];
            let tag = tags[index + 1];
            const commits = yield (0, fetchCommitsBetweenRefs_1.fetchCommitsBetweenRefs)(owner, repository, prevTag.name, tag.name);
            const output = (0, summarizeTag_1.summarizeTag)(commits, prevReleaseCommit);
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
            prevReleaseCommit = commits.at(-1);
        }
        ;
        // prevReleaseCommit = (await fetchCommitsBetweenRefs(owner, repository, "v11.0.1", "v11.0.2")).at(-1)
        // const commits = await fetchCommitsBetweenRefs(owner, repository, "v11.0.1", "v11.0.2")
        // const output = summarizeTag(commits, prevReleaseCommit);
        // console.log(`${[owner, team, repository].concat(output.map(item => String(item))).join(",")}`);
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const csvInputFilePath = process.argv[2];
        const data = fs.readFileSync(csvInputFilePath);
        const rows = (0, sync_1.parse)(data);
        for (const [owner, team, repository] of rows) {
            yield output(team, owner, repository);
        }
    });
}
if (require.main === module) {
    try {
        main();
    }
    catch (error) {
        console.error(error);
    }
}
