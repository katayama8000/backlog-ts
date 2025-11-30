import type { BacklogConfig } from "./config.ts";
import type {
  Activity,
  FileData,
  RecentlyViewedIssue,
  RecentlyViewedProject,
  RecentlyViewedWiki,
  Star,
  StarCount,
  User,
} from "./entities.ts";
import type {
  GetRecentlyViewedParams,
  GetUserActivitiesParams,
  GetUserStarsCountParams,
  GetUserStarsParams,
  PatchUserParams,
  PostUserParams,
} from "./params.ts";
import { buildUrl, download, request } from "./request.ts";

/**
 * Get user list
 * @see https://developer.nulab.com/docs/backlog/api/2/get-user-list/
 */
export async function getUsers(config: BacklogConfig): Promise<User[]> {
  return await request<User[]>(config, "users");
}

/**
 * Get user
 * @see https://developer.nulab.com/docs/backlog/api/2/get-user/
 */
export async function getUser(
  config: BacklogConfig,
  userId: number,
): Promise<User> {
  return await request<User>(config, `users/${userId}`);
}

/**
 * Add user
 * @see https://developer.nulab.com/docs/backlog/api/2/add-user/
 */
export async function postUser(
  config: BacklogConfig,
  params: PostUserParams,
): Promise<User> {
  return await request<User>(config, "users", {
    method: "POST",
    body: params,
  });
}

/**
 * Update user
 * @see https://developer.nulab.com/docs/backlog/api/2/update-user/
 */
export async function patchUser(
  config: BacklogConfig,
  userId: number,
  params: PatchUserParams,
): Promise<User> {
  return await request<User>(config, `users/${userId}`, {
    method: "PATCH",
    body: params,
  });
}

/**
 * Delete user
 * @see https://developer.nulab.com/docs/backlog/api/2/delete-user/
 */
export async function deleteUser(
  config: BacklogConfig,
  userId: number,
): Promise<User> {
  return await request<User>(config, `users/${userId}`, {
    method: "DELETE",
  });
}

/**
 * Get own user
 * @see https://developer.nulab.com/docs/backlog/api/2/get-own-user/
 */
export async function getMyself(config: BacklogConfig): Promise<User> {
  return await request<User>(config, "users/myself");
}

/**
 * Get user icon
 * @see https://developer.nulab.com/docs/backlog/api/2/get-user-icon/
 */
export async function getUserIcon(
  config: BacklogConfig,
  userId: number,
): Promise<FileData> {
  const result = await download(config, `users/${userId}/icon`);
  const url = buildUrl(config, `users/${userId}/icon`).split("?")[0]; // Remove query params from URL
  return {
    body: result.body,
    url,
    fileName: result.fileName,
  };
}

/**
 * Get user recent updates
 * @see https://developer.nulab.com/docs/backlog/api/2/get-user-recent-updates/
 */
export async function getUserActivities(
  config: BacklogConfig,
  userId: number,
  params: GetUserActivitiesParams,
): Promise<Activity[]> {
  return await request<Activity[]>(config, `users/${userId}/activities`, {
    params,
  });
}

/**
 * Get received star list
 * @see https://developer.nulab.com/docs/backlog/api/2/get-received-star-list/
 */
export async function getUserStars(
  config: BacklogConfig,
  userId: number,
  params: GetUserStarsParams,
): Promise<Star[]> {
  return await request<Star[]>(config, `users/${userId}/stars`, { params });
}

/**
 * Count user received stars
 * @see https://developer.nulab.com/docs/backlog/api/2/count-user-received-stars/
 */
export async function getUserStarsCount(
  config: BacklogConfig,
  userId: number,
  params: GetUserStarsCountParams,
): Promise<StarCount> {
  return await request<StarCount>(config, `users/${userId}/stars/count`, {
    params,
  });
}

/**
 * Get list of recently viewed issues
 * @see https://developer.nulab.com/docs/backlog/api/2/get-list-of-recently-viewed-issues/
 */
export async function getRecentlyViewedIssues(
  config: BacklogConfig,
  params: GetRecentlyViewedParams,
): Promise<RecentlyViewedIssue[]> {
  return await request<RecentlyViewedIssue[]>(
    config,
    "users/myself/recentlyViewedIssues",
    { params },
  );
}

/**
 * Get list of recently viewed projects
 * @see https://developer.nulab.com/docs/backlog/api/2/get-list-of-recently-viewed-projects/
 */
export async function getRecentlyViewedProjects(
  config: BacklogConfig,
  params: GetRecentlyViewedParams,
): Promise<RecentlyViewedProject[]> {
  return await request<RecentlyViewedProject[]>(
    config,
    "users/myself/recentlyViewedProjects",
    { params },
  );
}

/**
 * Get list of recently viewed wikis
 * @see https://developer.nulab.com/docs/backlog/api/2/get-list-of-recently-viewed-wikis/
 */
export async function getRecentlyViewedWikis(
  config: BacklogConfig,
  params: GetRecentlyViewedParams,
): Promise<RecentlyViewedWiki[]> {
  return await request<RecentlyViewedWiki[]>(
    config,
    "users/myself/recentlyViewedWikis",
    { params },
  );
}
