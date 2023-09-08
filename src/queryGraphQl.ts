import { graphql, GraphqlResponseError } from '@octokit/graphql';

async function queryGraphQl(query: string, maxRetries: number = 6): Promise<any> {
  const githubToken = process.env.GITHUB_TOKEN;

  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await graphql(
        {
          query: query,
          headers: {
            authorization: `token ${githubToken}`
          }
        }
      );
      return response;
    } catch (error) {
      console.error(`GraphQL request failed (retry ${retries + 1}):`, error);

      retries++;

      if (error instanceof GraphqlResponseError) {

        // レスポンスヘッダーから retry-after を取得
        const retryAfter = error.headers?.['retry-after'];

        if (retryAfter) {
          // 指定秒数待機
          const waitTime = parseInt(String(retryAfter), 10) * 1000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        const error_types = error?.errors?.map(error => error?.type);
        if (error_types !== undefined && error_types.some(error_type => error_type === 'RATE_LIMITED')) {
          console.error('rate limit exceeded')
          await new Promise(resolve => setTimeout(resolve, 10 * 60 * 1000));
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 60 * 1000));
      }
    }
  }

  throw new Error(`GraphQL request failed after ${maxRetries} retries.`);
}

export { queryGraphQl };
