/**
 * Backlog API client for Deno
 * @module
 */

export * from "./config.ts";
export * from "./entities.ts";
export * from "./params.ts";
export * from "./types.ts";
export * from "./space.ts";
export * from "./issue.ts";

import type { BacklogConfig } from "./config.ts";
import * as space from "./space.ts";
import * as issue from "./issue.ts";

/**
 * Create Backlog API client
 */
export function createClient(config: BacklogConfig) {
  return {
    // Space APIs
    getSpace: () => space.getSpace(config),
    getSpaceActivities: (
      params: Parameters<typeof space.getSpaceActivities>[1],
    ) => space.getSpaceActivities(config, params),
    getSpaceIcon: () => space.getSpaceIcon(config),
    getSpaceNotification: () => space.getSpaceNotification(config),
    putSpaceNotification: (
      params: Parameters<typeof space.putSpaceNotification>[1],
    ) => space.putSpaceNotification(config, params),

    // Issue APIs
    postIssue: (params: Parameters<typeof issue.postIssue>[1]) => issue.postIssue(config, params),
    getIssue: (issueIdOrKey: Parameters<typeof issue.getIssue>[1]) =>
      issue.getIssue(config, issueIdOrKey),
    getIssues: (params?: Parameters<typeof issue.getIssues>[1]) => issue.getIssues(config, params),
    getIssueCount: (params?: Parameters<typeof issue.getIssueCount>[1]) =>
      issue.getIssueCount(config, params),
  };
}

/**
 * Backlog client type
 */
export type BacklogClient = ReturnType<typeof createClient>;
