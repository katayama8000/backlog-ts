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

import type { BacklogConfig } from "./config.ts";
import * as space from "./space.ts";
import * as issue from "./issue.ts";
import * as doc from "./document.ts";
import * as project from "./project.ts";

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

  // Project APIs
  getProjects: (
    params?: Parameters<typeof project.getProjects>[1],
  ) => ReturnType<typeof project.getProjects>;
  getProject: (
    projectIdOrKey: Parameters<typeof project.getProject>[1],
  ) => ReturnType<typeof project.getProject>;
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

    // Project APIs
    getProjects: (params?: Parameters<typeof project.getProjects>[1]) =>
      project.getProjects(config, params),
    getProject: (projectIdOrKey: Parameters<typeof project.getProject>[1]) =>
      project.getProject(config, projectIdOrKey),
  };
}
