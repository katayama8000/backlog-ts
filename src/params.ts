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
