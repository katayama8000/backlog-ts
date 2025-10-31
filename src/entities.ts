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

/**
 * Issue type entity
 */
export interface IssueType {
  id: number;
  projectId: number;
  name: string;
  color: string;
  displayOrder: number;
  templateSummary?: string;
  templateDescription?: string;
}

/**
 * Priority entity
 */
export interface Priority {
  id: number;
  name: string;
}

/**
 * Resolution entity
 */
export interface Resolution {
  id: number;
  name: string;
}

/**
 * Project status entity
 */
export interface Status {
  id: number;
  projectId: number;
  name: string;
  color: string;
  displayOrder: number;
}

/**
 * Category entity
 */
export interface Category {
  id: number;
  name: string;
  displayOrder: number;
}

/**
 * Version entity
 */
export interface Version {
  id: number;
  projectId: number;
  name: string;
  description: string;
  startDate: string | null;
  releaseDueDate: string | null;
  archived: boolean;
  displayOrder: number;
}

/**
 * Custom field entity
 */
export interface CustomField {
  id: number;
  typeId: number;
  name: string;
  description: string;
  required: boolean;
  applicableIssueTypes?: number[];
  allowAddItem?: boolean;
  items?: CustomFieldItem[];
  value?: unknown;
}

/**
 * Custom field item entity
 */
export interface CustomFieldItem {
  id: number;
  name: string;
  displayOrder: number;
}

/**
 * File info entity
 */
export interface FileInfo {
  id: number;
  name: string;
  size: number;
}

/**
 * Issue file info entity
 */
export interface IssueFileInfo extends FileInfo {
  createdUser: User;
  created: string;
}

/**
 * Document file info entity
 */
export interface DocumentFileInfo extends FileInfo {
  createdUser: User;
  created: string;
}

/**
 * Shared file entity
 */
export interface SharedFile {
  id: number;
  type: string;
  dir: string;
  name: string;
  size: number;
  createdUser: User;
  created: string;
  updatedUser: User;
  updated: string;
}

/**
 * Star entity
 */
export interface Star {
  id: number;
  comment: string | null;
  url: string;
  title: string;
  presenter: User;
  created: string;
}

/**
 * Issue entity
 */
export interface Issue {
  id: number;
  projectId: number;
  issueKey: string;
  keyId: number;
  issueType: IssueType;
  summary: string;
  description: string;
  resolution?: Resolution;
  priority: Priority;
  status: Status;
  assignee?: User;
  category: Category[];
  versions: Version[];
  milestone: Version[];
  startDate?: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  parentIssueId?: number;
  createdUser: User;
  created: string;
  updatedUser: User;
  updated: string;
  customFields: CustomField[];
  attachments: IssueFileInfo[];
  sharedFiles: SharedFile[];
  stars: Star[];
}

/**
 * Document tag entity
 */
export interface DocumentTag {
  id: number;
  name: string;
}

/**
 * Document entity
 */
export interface Document {
  id: string;
  projectId: number;
  title: string;
  plain: string;
  json: string;
  statusId: number;
  emoji: string | null;
  attachments: DocumentFileInfo[];
  tags: DocumentTag[];
  createdUser: User;
  created: string;
  updatedUser: User;
  updated: string;
}

/**
 * Document tree node entity
 */
export interface DocumentTreeNode {
  id: string;
  name?: string;
  children: DocumentTreeNode[];
  statusId?: number;
  emoji?: string;
  emojiType?: string;
  updated?: string;
}

/**
 * Active/Trash tree entity
 */
export interface ActiveTrashTree {
  id: string;
  children: DocumentTreeNode[];
}

/**
 * Document tree entity
 */
export interface DocumentTree {
  projectId: number;
  activeTree?: ActiveTrashTree;
  trashTree?: ActiveTrashTree;
}
