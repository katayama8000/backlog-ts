import { assertEquals, assertExists } from "@std/assert";
import { createClient } from "../src/mod.ts";
import type { Issue, PostIssueParams } from "../src/mod.ts";
import { createMockServer } from "./test_utils.ts";

Deno.test("postIssue - success", async () => {
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
    priority: {
      id: 3,
      name: "Normal",
    },
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

  const server = createMockServer(async (req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/issues");
    assertEquals(req.method, "POST");

    const body = (await req.json()) as PostIssueParams;
    assertEquals(body.projectId, 1);
    assertEquals(body.summary, "Test Issue");
    assertEquals(body.issueTypeId, 1);
    assertEquals(body.priorityId, 3);

    return new Response(JSON.stringify(mockIssue), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
    });

    const issue = await client.postIssue({
      projectId: 1,
      summary: "Test Issue",
      issueTypeId: 1,
      priorityId: 3,
    });

    assertEquals(issue.id, 1);
    assertEquals(issue.issueKey, "TEST-1");
    assertEquals(issue.summary, "Test Issue");
  } finally {
    server.close();
  }
});

Deno.test("postIssue - with optional fields", async () => {
  const server = createMockServer(async (req) => {
    const body = (await req.json()) as PostIssueParams;
    assertEquals(body.description, "Detailed description");
    assertEquals(body.assigneeId, 2);
    assertEquals(body.startDate, "2023-01-01");
    assertEquals(body.dueDate, "2023-01-31");

    return new Response(JSON.stringify({ id: 1 }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
    });

    await client.postIssue({
      projectId: 1,
      summary: "Test Issue",
      issueTypeId: 1,
      priorityId: 3,
      description: "Detailed description",
      assigneeId: 2,
      startDate: "2023-01-01",
      dueDate: "2023-01-31",
    });
  } finally {
    server.close();
  }
});

Deno.test("getIssue - success", async () => {
  const mockIssue: Partial<Issue> = {
    id: 123,
    issueKey: "TEST-123",
    summary: "Get Issue Test",
  };

  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/issues/TEST-123");
    assertEquals(req.method, "GET");

    return new Response(JSON.stringify(mockIssue), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
    });

    const issue = await client.getIssue("TEST-123");
    assertEquals(issue.id, 123);
    assertEquals(issue.issueKey, "TEST-123");
  } finally {
    server.close();
  }
});

Deno.test("getIssues - with params", async () => {
  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/issues");
    assertEquals(url.searchParams.get("projectId[]"), "1");
    assertEquals(url.searchParams.get("statusId[]"), "1");
    assertEquals(url.searchParams.get("count"), "20");

    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
    });

    const issues = await client.getIssues({
      projectId: [1],
      statusId: [1],
      count: 20,
    });

    assertExists(issues);
    assertEquals(Array.isArray(issues), true);
  } finally {
    server.close();
  }
});

Deno.test("getIssueCount - success", async () => {
  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/issues/count");

    return new Response(JSON.stringify({ count: 42 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
    });

    const result = await client.getIssueCount({
      projectId: [1],
    });

    assertEquals(result.count, 42);
  } finally {
    server.close();
  }
});
