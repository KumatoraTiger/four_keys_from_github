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
exports.fetchCommitsBetweenRefs = void 0;
const queryGraphQl_1 = require("./queryGraphQl");
function generateQuery(owner, repo, baseRefName, headRefName, cursor) {
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
  `;
}
function fetchCommitsBetweenRefs(owner, repo, baseRefName, headRefName) {
    return __awaiter(this, void 0, void 0, function* () {
        let allCommits = [];
        let cursor = null;
        let hasNextPage = true;
        while (hasNextPage) {
            const resp = yield (0, queryGraphQl_1.queryGraphQl)(generateQuery(owner, repo, baseRefName, headRefName, cursor));
            const { pageInfo, nodes: nodes } = resp.repository.ref.compare.commits;
            nodes.forEach((node) => {
                // console.log(node);
                // console.log(node.associatedPullRequests.nodes[0]);
            });
            allCommits = allCommits.concat(nodes);
            hasNextPage = pageInfo.hasNextPage;
            cursor = pageInfo.endCursor;
        }
        // console.log(allCommits)
        return allCommits;
    });
}
exports.fetchCommitsBetweenRefs = fetchCommitsBetweenRefs;
