/**
 * Text formatting rule type for Backlog
 */
export type TextFormattingRule = "backlog" | "markdown";

/**
 * Classic role types in Backlog
 */
export enum ClassicRoleType {
  Admin = 1,
  User = 2,
  Reporter = 3,
  Viewer = 4,
  GuestReporter = 5,
  GuestViewer = 6,
}

/**
 * Normal role types in Backlog
 */
export enum NormalRoleType {
  Admin = 1,
  MemberOrGuest = 2,
  MemberOrGuestForAddIssues = 3,
  MemberOrGuestForViewIssues = 4,
}

/**
 * Role type union
 */
export type RoleType = ClassicRoleType | NormalRoleType;

/**
 * Language type for Backlog
 */
export type Language = "en" | "ja" | null;

/**
 * Activity types in Backlog
 */
export enum ActivityType {
  Undefined = -1,
  IssueCreated = 1,
  IssueUpdated = 2,
  IssueCommented = 3,
  IssueDeleted = 4,
  WikiCreated = 5,
  WikiUpdated = 6,
  WikiDeleted = 7,
  FileAdded = 8,
  FileUpdated = 9,
  FileDeleted = 10,
  SvnCommitted = 11,
  GitPushed = 12,
  GitRepositoryCreated = 13,
  IssueMultiUpdated = 14,
  ProjectUserAdded = 15,
  ProjectUserRemoved = 16,
  NotifyAdded = 17,
  PullRequestAdded = 18,
  PullRequestUpdated = 19,
  PullRequestCommented = 20,
  PullRequestMerged = 21,
  MilestoneCreated = 22,
  MilestoneUpdated = 23,
  MilestoneDeleted = 24,
  ProjectGroupAdded = 25,
  ProjectGroupDeleted = 26,
}

/**
 * Order type for sorting
 */
export type Order = "asc" | "desc";
