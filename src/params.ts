import type { ActivityType, Order } from "./types.ts";

/**
 * Notification related parameters
 */
export interface GetNotificationsParams {
  minId?: number;
  maxId?: number;
  count?: number;
  order?: Order;
}

export interface GetNotificationsCountParams {
  alreadyRead: boolean;
  resourceAlreadyRead: boolean;
}

/**
 * Document related parameters
 */
export interface GetDocumentsParams {
  projectId?: number[];
  keyword?: string;
  sort?: "created" | "updated";
  order?: Order;
  offset: number;
  count?: number;
}

export interface GetDocumentTreeParams {
  projectIdOrKey: string;
}

/**
 * Space related parameters
 */
export interface GetActivitiesParams {
  activityTypeId?: ActivityType[];
  minId?: number;
  maxId?: number;
  count?: number;
  order?: Order;
}

export interface PutSpaceNotificationParams {
  content: string;
}

/**
 * Project related parameters
 */
export interface GetProjectsParams {
  archived?: boolean;
  all?: boolean;
}

/**
 * Issue related parameters
 */
export interface PostIssueParams {
  projectId: number;
  summary: string;
  priorityId: number;
  issueTypeId: number;
  parentIssueId?: number;
  description?: string;
  startDate?: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  categoryId?: number[];
  versionId?: number[];
  milestoneId?: number[];
  assigneeId?: number;
  notifiedUserId?: number[];
  attachmentId?: number[];
  // Custom fields (e.g., customField_123)
  // deno-lint-ignore no-explicit-any
  [key: string]: any;
}

export interface GetIssuesParams {
  projectId?: number[];
  issueTypeId?: number[];
  categoryId?: number[];
  versionId?: number[];
  milestoneId?: number[];
  statusId?: number[];
  priorityId?: number[];
  assigneeId?: number[];
  createdUserId?: number[];
  resolutionId?: number[];
  parentChild?: number;
  attachment?: boolean;
  sharedFile?: boolean;
  sort?: string;
  order?: Order;
  offset?: number;
  count?: number;
  createdSince?: string;
  createdUntil?: string;
  updatedSince?: string;
  updatedUntil?: string;
  startDateSince?: string;
  startDateUntil?: string;
  dueDateSince?: string;
  dueDateUntil?: string;
  id?: number[];
  parentIssueId?: number[];
  keyword?: string;
}
