/**
 * Backlog API client for Deno
 * @module
 */

export * from "./config.ts";
export * from "./entities.ts";
export * from "./params.ts";
export * from "./types.ts";
export * from "./space.ts";

import type { BacklogConfig } from "./config.ts";
import * as space from "./space.ts";

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
  };
}

/**
 * Backlog client type
 */
export type BacklogClient = ReturnType<typeof createClient>;
