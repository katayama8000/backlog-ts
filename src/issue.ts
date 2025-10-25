import type { BacklogConfig } from "./config.ts";
import type { Issue } from "./entities.ts";
import type { GetIssuesParams, PostIssueParams } from "./params.ts";
import { request } from "./request.ts";

/**
 * Add a new issue
 * @see https://developer.nulab.com/docs/backlog/api/2/add-issue/
 */
export async function postIssue(
  config: BacklogConfig,
  params: PostIssueParams,
): Promise<Issue> {
  return await request<Issue>(config, "issues", {
    method: "POST",
    body: params,
  });
}

/**
 * Get issue
 * @see https://developer.nulab.com/docs/backlog/api/2/get-issue/
 */
export async function getIssue(
  config: BacklogConfig,
  issueIdOrKey: string | number,
): Promise<Issue> {
  return await request<Issue>(config, `issues/${issueIdOrKey}`);
}

/**
 * Get issue list
 * @see https://developer.nulab.com/docs/backlog/api/2/get-issue-list/
 */
export async function getIssues(
  config: BacklogConfig,
  params?: GetIssuesParams,
): Promise<Issue[]> {
  return await request<Issue[]>(config, "issues", { params });
}

/**
 * Get issue count
 * @see https://developer.nulab.com/docs/backlog/api/2/count-issue/
 */
export async function getIssueCount(
  config: BacklogConfig,
  params?: GetIssuesParams,
): Promise<{ count: number }> {
  return await request<{ count: number }>(config, "issues/count", { params });
}
