"use strict";
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
exports.fetchTags = void 0;
const queryGraphQl_1 = require("./queryGraphQl");
function generateQuery(owner, repo, cursor) {
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
  `;
}
function fetchTagsFromGithub(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        let allTags = [];
        let cursor = null;
        let hasNextPage = true;
        while (hasNextPage) {
            const resp = yield (0, queryGraphQl_1.queryGraphQl)(generateQuery(owner, repo, cursor));
            const { pageInfo, nodes: nodes } = resp.repository.refs;
            allTags = allTags.concat(nodes);
            hasNextPage = pageInfo.hasNextPage;
            cursor = pageInfo.endCursor;
        }
        return allTags;
    });
}
function formatGraphQlQueryResponseTag(tag) {
    var _a, _b, _c, _d, _e, _f;
    return {
        name: tag.name,
        commitAbbreviatedOid: ((_a = tag.target) === null || _a === void 0 ? void 0 : _a.abbreviatedOid) || ((_c = (_b = tag.target) === null || _b === void 0 ? void 0 : _b.target) === null || _c === void 0 ? void 0 : _c.abbreviatedOid),
        committedDate: ((_d = tag.target) === null || _d === void 0 ? void 0 : _d.committedDate) || ((_f = (_e = tag.target) === null || _e === void 0 ? void 0 : _e.target) === null || _f === void 0 ? void 0 : _f.committedDate)
    };
}
function sortByCommittedDate(tags) {
    return tags.sort((a, b) => {
        if (a.committedDate && b.committedDate) {
            return a.committedDate > b.committedDate ? 1 : -1;
        }
        return 0;
    });
}
function fetchTags(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        const allTags = yield fetchTagsFromGithub(owner, repo);
        return sortByCommittedDate(allTags.map(tag => formatGraphQlQueryResponseTag(tag)));
    });
}
exports.fetchTags = fetchTags;
