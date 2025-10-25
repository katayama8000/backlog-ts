import type { BacklogConfig } from "./config.ts";
import type { Activity, FileData, Space, SpaceNotification } from "./entities.ts";
import type { GetActivitiesParams, PutSpaceNotificationParams } from "./params.ts";
import { buildUrl, download, request } from "./request.ts";

/**
 * Get space information
 * @see https://developer.nulab.com/docs/backlog/api/2/get-space/
 */
export async function getSpace(config: BacklogConfig): Promise<Space> {
  return await request<Space>(config, "space");
}

/**
 * Get recent updates
 * @see https://developer.nulab.com/docs/backlog/api/2/get-recent-updates/
 */
export async function getSpaceActivities(
  config: BacklogConfig,
  params: GetActivitiesParams,
): Promise<Activity[]> {
  return await request<Activity[]>(config, "space/activities", { params });
}

/**
 * Get space logo
 * @see https://developer.nulab.com/docs/backlog/api/2/get-space-logo/
 */
export async function getSpaceIcon(config: BacklogConfig): Promise<FileData> {
  const result = await download(config, "space/image");
  const url = buildUrl(config, "space/image").split("?")[0]; // Remove query params from URL
  return {
    body: result.body,
    url,
    fileName: result.fileName,
  };
}

/**
 * Get space notification
 * @see https://developer.nulab.com/docs/backlog/api/2/get-space-notification/
 */
export async function getSpaceNotification(
  config: BacklogConfig,
): Promise<SpaceNotification> {
  return await request<SpaceNotification>(config, "space/notification");
}

/**
 * Update space notification
 * @see https://developer.nulab.com/docs/backlog/api/2/update-space-notification/
 */
export async function putSpaceNotification(
  config: BacklogConfig,
  params: PutSpaceNotificationParams,
): Promise<SpaceNotification> {
  return await request<SpaceNotification>(config, "space/notification", {
    method: "PUT",
    body: params,
  });
}
