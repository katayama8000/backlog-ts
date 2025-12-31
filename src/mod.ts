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
export * from "./document.ts";
export * from "./project.ts";
export * from "./user.ts";

import type { BacklogConfig } from "./config.ts";
import * as space from "./space.ts";
import * as issue from "./issue.ts";
import * as doc from "./document.ts";
import * as project from "./project.ts";
import * as user from "./user.ts";

/**
 * Backlog client interface
 */
export interface BacklogClient {
  // Space APIs
  getSpace: () => ReturnType<typeof space.getSpace>;
  getSpaceActivities: (
    params: Parameters<typeof space.getSpaceActivities>[1],
  ) => ReturnType<typeof space.getSpaceActivities>;
  getSpaceIcon: () => ReturnType<typeof space.getSpaceIcon>;
  getSpaceNotification: () => ReturnType<typeof space.getSpaceNotification>;
  putSpaceNotification: (
    params: Parameters<typeof space.putSpaceNotification>[1],
  ) => ReturnType<typeof space.putSpaceNotification>;

  // Issue APIs
  postIssue: (
    params: Parameters<typeof issue.postIssue>[1],
  ) => ReturnType<typeof issue.postIssue>;
  getIssue: (
    issueIdOrKey: Parameters<typeof issue.getIssue>[1],
  ) => ReturnType<typeof issue.getIssue>;
  getIssues: (
    params?: Parameters<typeof issue.getIssues>[1],
  ) => ReturnType<typeof issue.getIssues>;
  getIssueCount: (
    params?: Parameters<typeof issue.getIssueCount>[1],
  ) => ReturnType<typeof issue.getIssueCount>;

  // Document APIs
  getDocuments: (
    params: Parameters<typeof doc.getDocuments>[1],
  ) => ReturnType<typeof doc.getDocuments>;
  getDocument: (
    documentId: Parameters<typeof doc.getDocument>[1],
  ) => ReturnType<typeof doc.getDocument>;
  getDocumentTree: (
    params: Parameters<typeof doc.getDocumentTree>[1],
  ) => ReturnType<typeof doc.getDocumentTree>;
  downloadDocumentAttachment: (
    documentId: Parameters<typeof doc.downloadDocumentAttachment>[1],
    attachmentId: Parameters<typeof doc.downloadDocumentAttachment>[2],
  ) => ReturnType<typeof doc.downloadDocumentAttachment>;

  // Project APIs
  getProjects: (
    params?: Parameters<typeof project.getProjects>[1],
  ) => ReturnType<typeof project.getProjects>;
  getProject: (
    projectIdOrKey: Parameters<typeof project.getProject>[1],
  ) => ReturnType<typeof project.getProject>;

  // User APIs
  getUsers: () => ReturnType<typeof user.getUsers>;
  getUser: (
    userId: Parameters<typeof user.getUser>[1],
  ) => ReturnType<typeof user.getUser>;
  postUser: (
    params: Parameters<typeof user.postUser>[1],
  ) => ReturnType<typeof user.postUser>;
  patchUser: (
    userId: Parameters<typeof user.patchUser>[1],
    params: Parameters<typeof user.patchUser>[2],
  ) => ReturnType<typeof user.patchUser>;
  deleteUser: (
    userId: Parameters<typeof user.deleteUser>[1],
  ) => ReturnType<typeof user.deleteUser>;
  getMyself: () => ReturnType<typeof user.getMyself>;
  getUserIcon: (
    userId: Parameters<typeof user.getUserIcon>[1],
  ) => ReturnType<typeof user.getUserIcon>;
  getUserActivities: (
    userId: Parameters<typeof user.getUserActivities>[1],
    params: Parameters<typeof user.getUserActivities>[2],
  ) => ReturnType<typeof user.getUserActivities>;
  getUserStars: (
    userId: Parameters<typeof user.getUserStars>[1],
    params: Parameters<typeof user.getUserStars>[2],
  ) => ReturnType<typeof user.getUserStars>;
  getUserStarsCount: (
    userId: Parameters<typeof user.getUserStarsCount>[1],
    params: Parameters<typeof user.getUserStarsCount>[2],
  ) => ReturnType<typeof user.getUserStarsCount>;
  getRecentlyViewedIssues: (
    params: Parameters<typeof user.getRecentlyViewedIssues>[1],
  ) => ReturnType<typeof user.getRecentlyViewedIssues>;
  getRecentlyViewedProjects: (
    params: Parameters<typeof user.getRecentlyViewedProjects>[1],
  ) => ReturnType<typeof user.getRecentlyViewedProjects>;
  getRecentlyViewedWikis: (
    params: Parameters<typeof user.getRecentlyViewedWikis>[1],
  ) => ReturnType<typeof user.getRecentlyViewedWikis>;
}

/**
 * Create Backlog API client
 */
export function createClient(config: BacklogConfig): BacklogClient {
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

    // Document APIs
    getDocuments: (params: Parameters<typeof doc.getDocuments>[1]) =>
      doc.getDocuments(config, params),
    getDocument: (documentId: Parameters<typeof doc.getDocument>[1]) =>
      doc.getDocument(config, documentId),
    getDocumentTree: (params: Parameters<typeof doc.getDocumentTree>[1]) =>
      doc.getDocumentTree(config, params),
    downloadDocumentAttachment: (
      documentId: Parameters<typeof doc.downloadDocumentAttachment>[1],
      attachmentId: Parameters<typeof doc.downloadDocumentAttachment>[2],
    ) => doc.downloadDocumentAttachment(config, documentId, attachmentId),

    // Project APIs
    getProjects: (params?: Parameters<typeof project.getProjects>[1]) =>
      project.getProjects(config, params),
    getProject: (projectIdOrKey: Parameters<typeof project.getProject>[1]) =>
      project.getProject(config, projectIdOrKey),

    // User APIs
    getUsers: () => user.getUsers(config),
    getUser: (userId: Parameters<typeof user.getUser>[1]) => user.getUser(config, userId),
    postUser: (params: Parameters<typeof user.postUser>[1]) => user.postUser(config, params),
    patchUser: (
      userId: Parameters<typeof user.patchUser>[1],
      params: Parameters<typeof user.patchUser>[2],
    ) => user.patchUser(config, userId, params),
    deleteUser: (userId: Parameters<typeof user.deleteUser>[1]) => user.deleteUser(config, userId),
    getMyself: () => user.getMyself(config),
    getUserIcon: (userId: Parameters<typeof user.getUserIcon>[1]) =>
      user.getUserIcon(config, userId),
    getUserActivities: (
      userId: Parameters<typeof user.getUserActivities>[1],
      params: Parameters<typeof user.getUserActivities>[2],
    ) => user.getUserActivities(config, userId, params),
    getUserStars: (
      userId: Parameters<typeof user.getUserStars>[1],
      params: Parameters<typeof user.getUserStars>[2],
    ) => user.getUserStars(config, userId, params),
    getUserStarsCount: (
      userId: Parameters<typeof user.getUserStarsCount>[1],
      params: Parameters<typeof user.getUserStarsCount>[2],
    ) => user.getUserStarsCount(config, userId, params),
    getRecentlyViewedIssues: (
      params: Parameters<typeof user.getRecentlyViewedIssues>[1],
    ) => user.getRecentlyViewedIssues(config, params),
    getRecentlyViewedProjects: (
      params: Parameters<typeof user.getRecentlyViewedProjects>[1],
    ) => user.getRecentlyViewedProjects(config, params),
    getRecentlyViewedWikis: (
      params: Parameters<typeof user.getRecentlyViewedWikis>[1],
    ) => user.getRecentlyViewedWikis(config, params),
  };
}
