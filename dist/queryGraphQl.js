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
exports.queryGraphQl = void 0;
const graphql_1 = require("@octokit/graphql");
function queryGraphQl(query, maxRetries = 3) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const githubToken = process.env.GITHUB_TOKEN;
        let retries = 0;
        while (retries < maxRetries) {
            try {
                const response = yield (0, graphql_1.graphql)({
                    query: query,
                    headers: {
                        authorization: `token ${githubToken}`
                    }
                });
                return response;
            }
            catch (error) {
                console.error(`GraphQL request failed (retry ${retries + 1}):`, error);
                retries++;
                if (error instanceof graphql_1.GraphqlResponseError) {
                    // レスポンスヘッダーから retry-after を取得
                    const retryAfter = (_a = error.headers) === null || _a === void 0 ? void 0 : _a['retry-after'];
                    if (retryAfter) {
                        // 指定秒数待機
                        const waitTime = parseInt(String(retryAfter), 10) * 1000;
                        yield new Promise(resolve => setTimeout(resolve, waitTime));
                        continue;
                    }
                    const error_types = (_b = error === null || error === void 0 ? void 0 : error.errors) === null || _b === void 0 ? void 0 : _b.map(error => error === null || error === void 0 ? void 0 : error.type);
                    if (error_types !== undefined && error_types.some(error_type => error_type === 'RATE_LIMITED')) {
                        console.error('rate limit exceeded');
                        yield new Promise(resolve => setTimeout(resolve, 60 * 60 * 1000));
                    }
                }
                else {
                    yield new Promise(resolve => setTimeout(resolve, 60 * 1000));
                }
            }
        }
        throw new Error(`GraphQL request failed after ${maxRetries} retries.`);
    });
}
exports.queryGraphQl = queryGraphQl;
