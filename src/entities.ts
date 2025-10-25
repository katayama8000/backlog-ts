/**
 * Space entity
 */
export interface Space {
  spaceKey: string;
  name: string;
  ownerId: number;
  lang: string;
  timezone: string;
  reportSendTime: string;
  textFormattingRule: string;
  created: string;
  updated: string;
}

/**
 * Space notification entity
 */
export interface SpaceNotification {
  content: string;
  updated: string;
}

/**
 * User entity
 */
export interface User {
  id: number;
  userId: string;
  name: string;
  roleType: number;
  lang: string;
  mailAddress: string;
  nulabAccount?: {
    nulabId: string;
    name: string;
    uniqueId: string;
  };
  keyword?: string;
}

/**
 * Project entity
 */
export interface Project {
  id: number;
  projectKey: string;
  name: string;
  chartEnabled: boolean;
  useResolvedForChart: boolean;
  subtaskingEnabled: boolean;
  projectLeaderCanEditProjectLeader: boolean;
  useWiki: boolean;
  useFileSharing: boolean;
  useWikiTreeView: boolean;
  useSubversion: boolean;
  useGit: boolean;
  useOriginalImageSizeAtWiki: boolean;
  textFormattingRule: string;
  archived: boolean;
  displayOrder: number;
  useDevAttributes: boolean;
}

/**
 * Activity entity
 */
export interface Activity {
  id: number;
  project: Project;
  type: number;
  content: {
    id: number;
    key_id?: number;
    summary?: string;
    description?: string;
    comment?: {
      id: number;
      content: string;
    };
    changes?: Array<{
      field: string;
      new_value: string;
      old_value: string;
      type: string;
    }>;
  };
  notifications: Array<{
    id: number;
    alreadyRead: boolean;
    reason: number;
    user: User;
    resourceAlreadyRead: boolean;
  }>;
  createdUser: User;
  created: string;
}

/**
 * File data entity
 */
export interface FileData {
  body: ArrayBuffer;
  url: string;
  fileName?: string;
}
