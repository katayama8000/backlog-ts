/**
 * Tests for subpath imports (tree-shaking support).
 *
 * Verifies that individual domain modules can be imported and used directly
 * without going through the main `mod.ts` entry point.
 *
 * In production usage, users would import via jsr: specifiers:
 *   import { getSpace } from "jsr:@katayama8000/backlog-ts/space";
 *   import { getIssues } from "jsr:@katayama8000/backlog-ts/issue";
 *
 * In this test suite, we use relative paths which are equivalent to the
 * exported subpaths (./space → src/space.ts, ./issue → src/issue.ts, etc.).
 */
import { assertEquals } from "@std/assert";
import { getSpace } from "../src/space.ts";
import { getIssue, getIssueCount, getIssues, postIssue } from "../src/issue.ts";
import { getProject, getProjects } from "../src/project.ts";
import { getDocument, getDocuments } from "../src/document.ts";
import { getMyself, getUser, getUsers } from "../src/user.ts";
import type { BacklogConfig } from "../src/config.ts";
import type { Issue, Project, Space } from "../src/entities.ts";
import { createMockServer } from "./test_utils.ts";

// ---------------------------------------------------------------------------
// Space subpath
// ---------------------------------------------------------------------------

Deno.test("subpath import: getSpace - success", async () => {
  const mockSpace: Space = {
    spaceKey: "TEST",
    name: "Test Space",
    ownerId: 1,
    lang: "ja",
    timezone: "Asia/Tokyo",
    reportSendTime: "08:00:00",
    textFormattingRule: "markdown",
    created: "2023-01-01T00:00:00Z",
    updated: "2023-01-01T00:00:00Z",
  };

  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/space");
    assertEquals(url.searchParams.get("apiKey"), "test-key");
    return new Response(JSON.stringify(mockSpace), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const config: BacklogConfig = { host: server.host, apiKey: "test-key" };
    const space = await getSpace(config);
    assertEquals(space, mockSpace);
  } finally {
    server.close();
  }
});

// ---------------------------------------------------------------------------
// Issue subpath
// ---------------------------------------------------------------------------

const mockIssue: Issue = {
  id: 1,
  projectId: 1,
  issueKey: "TEST-1",
  keyId: 1,
  issueType: {
    id: 1,
    projectId: 1,
    name: "Task",
    color: "#7ea800",
    displayOrder: 0,
  },
  summary: "Test Issue",
  description: "Test Description",
  priority: { id: 3, name: "Normal" },
  status: {
    id: 1,
    projectId: 1,
    name: "Open",
    color: "#ed8077",
    displayOrder: 0,
  },
  assignee: {
    id: 1,
    userId: "test",
    name: "Test User",
    roleType: 1,
    lang: "ja",
    mailAddress: "test@example.com",
  },
  category: [],
  versions: [],
  milestone: [],
  createdUser: {
    id: 1,
    userId: "test",
    name: "Test User",
    roleType: 1,
    lang: "ja",
    mailAddress: "test@example.com",
  },
  created: "2023-01-01T00:00:00Z",
  updatedUser: {
    id: 1,
    userId: "test",
    name: "Test User",
    roleType: 1,
    lang: "ja",
    mailAddress: "test@example.com",
  },
  updated: "2023-01-01T00:00:00Z",
  customFields: [],
  attachments: [],
  sharedFiles: [],
  stars: [],
};

Deno.test("subpath import: getIssues - success", async () => {
  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/issues");
    assertEquals(url.searchParams.getAll("projectId[]"), ["123"]);
    return new Response(JSON.stringify([mockIssue]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const config: BacklogConfig = { host: server.host, apiKey: "test-key" };
    const issues = await getIssues(config, { projectId: [123] });
    assertEquals(issues.length, 1);
    assertEquals(issues[0].issueKey, "TEST-1");
  } finally {
    server.close();
  }
});

Deno.test("subpath import: getIssue - success", async () => {
  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/issues/TEST-1");
    return new Response(JSON.stringify(mockIssue), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const config: BacklogConfig = { host: server.host, apiKey: "test-key" };
    const issue = await getIssue(config, "TEST-1");
    assertEquals(issue.issueKey, "TEST-1");
  } finally {
    server.close();
  }
});

Deno.test("subpath import: getIssueCount - success", async () => {
  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/issues/count");
    return new Response(JSON.stringify({ count: 42 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const config: BacklogConfig = { host: server.host, apiKey: "test-key" };
    const result = await getIssueCount(config);
    assertEquals(result.count, 42);
  } finally {
    server.close();
  }
});

Deno.test("subpath import: postIssue - success", async () => {
  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/issues");
    assertEquals(req.method, "POST");
    return new Response(JSON.stringify(mockIssue), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const config: BacklogConfig = { host: server.host, apiKey: "test-key" };
    const issue = await postIssue(config, {
      projectId: 1,
      summary: "Test Issue",
      issueTypeId: 1,
      priorityId: 3,
    });
    assertEquals(issue.summary, "Test Issue");
  } finally {
    server.close();
  }
});

// ---------------------------------------------------------------------------
// Project subpath
// ---------------------------------------------------------------------------

const mockProject: Project = {
  id: 1,
  projectKey: "TEST",
  name: "Test Project",
  chartEnabled: false,
  useResolvedForChart: false,
  subtaskingEnabled: false,
  projectLeaderCanEditProjectLeader: false,
  useWiki: true,
  useFileSharing: true,
  useWikiTreeView: false,
  useSubversion: false,
  useGit: true,
  useOriginalImageSizeAtWiki: false,
  textFormattingRule: "markdown",
  archived: false,
  displayOrder: 0,
  useDevAttributes: false,
};

Deno.test("subpath import: getProjects - success", async () => {
  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/projects");
    return new Response(JSON.stringify([mockProject]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const config: BacklogConfig = { host: server.host, apiKey: "test-key" };
    const projects = await getProjects(config);
    assertEquals(projects.length, 1);
    assertEquals(projects[0].projectKey, "TEST");
  } finally {
    server.close();
  }
});

Deno.test("subpath import: getProject - success", async () => {
  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/projects/TEST");
    return new Response(JSON.stringify(mockProject), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const config: BacklogConfig = { host: server.host, apiKey: "test-key" };
    const project = await getProject(config, "TEST");
    assertEquals(project.projectKey, "TEST");
  } finally {
    server.close();
  }
});

// ---------------------------------------------------------------------------
// Document subpath
// ---------------------------------------------------------------------------

Deno.test("subpath import: getDocuments - success", async () => {
  const mockDocuments = [{ id: "doc-1", name: "Test Document" }];

  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/documents");
    return new Response(JSON.stringify(mockDocuments), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const config: BacklogConfig = { host: server.host, apiKey: "test-key" };
    const docs = await getDocuments(config, { offset: 0 });
    assertEquals(docs.length, 1);
  } finally {
    server.close();
  }
});

Deno.test("subpath import: getDocument - success", async () => {
  const mockDocument = { id: "doc-1", name: "Test Document" };

  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/documents/doc-1");
    return new Response(JSON.stringify(mockDocument), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const config: BacklogConfig = { host: server.host, apiKey: "test-key" };
    const doc = await getDocument(config, "doc-1");
    assertEquals(doc.id, "doc-1");
  } finally {
    server.close();
  }
});

// ---------------------------------------------------------------------------
// User subpath
// ---------------------------------------------------------------------------

const mockUser = {
  id: 1,
  userId: "test",
  name: "Test User",
  roleType: 1,
  lang: "ja",
  mailAddress: "test@example.com",
};

Deno.test("subpath import: getUsers - success", async () => {
  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/users");
    return new Response(JSON.stringify([mockUser]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const config: BacklogConfig = { host: server.host, apiKey: "test-key" };
    const users = await getUsers(config);
    assertEquals(users.length, 1);
    assertEquals(users[0].userId, "test");
  } finally {
    server.close();
  }
});

Deno.test("subpath import: getUser - success", async () => {
  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/users/1");
    return new Response(JSON.stringify(mockUser), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const config: BacklogConfig = { host: server.host, apiKey: "test-key" };
    const user = await getUser(config, 1);
    assertEquals(user.userId, "test");
  } finally {
    server.close();
  }
});

Deno.test("subpath import: getMyself - success", async () => {
  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/users/myself");
    return new Response(JSON.stringify(mockUser), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const config: BacklogConfig = { host: server.host, apiKey: "test-key" };
    const myself = await getMyself(config);
    assertEquals(myself.userId, "test");
  } finally {
    server.close();
  }
});
