import { assertEquals, assertRejects } from "@std/assert";
import { createClient } from "../src/mod.ts";
import type { Activity, Space, SpaceNotification } from "../src/entities.ts";
import { ActivityType } from "../src/types.ts";
import { createMockServer } from "./test_utils.ts";

Deno.test("getSpace - success", async () => {
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
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
    });

    const space = await client.getSpace();
    assertEquals(space, mockSpace);
  } finally {
    server.close();
  }
});

Deno.test("getSpace - with OAuth2 token", async () => {
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
    const authHeader = req.headers.get("Authorization");
    assertEquals(authHeader, "Bearer test-token");

    return new Response(JSON.stringify(mockSpace), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      accessToken: "test-token",
    });

    const space = await client.getSpace();
    assertEquals(space.spaceKey, "TEST");
  } finally {
    server.close();
  }
});

Deno.test("getSpaceActivities - success with params", async () => {
  const mockActivities: Activity[] = [
    {
      id: 1,
      project: {
        id: 1,
        projectKey: "TEST",
        name: "Test Project",
        chartEnabled: false,
        useResolvedForChart: false,
        subtaskingEnabled: false,
        projectLeaderCanEditProjectLeader: false,
        useWiki: true,
        useFileSharing: true,
        useWikiTreeView: true,
        useSubversion: false,
        useGit: true,
        useOriginalImageSizeAtWiki: false,
        textFormattingRule: "markdown",
        archived: false,
        displayOrder: 0,
        useDevAttributes: false,
      },
      type: ActivityType.IssueCreated,
      content: {
        id: 1,
        key_id: 1,
        summary: "Test Issue",
      },
      notifications: [],
      createdUser: {
        id: 1,
        userId: "test",
        name: "Test User",
        roleType: 1,
        lang: "ja",
        mailAddress: "test@example.com",
      },
      created: "2023-01-01T00:00:00Z",
    },
  ];

  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/space/activities");
    assertEquals(url.searchParams.get("count"), "10");
    assertEquals(url.searchParams.get("order"), "desc");
    assertEquals(url.searchParams.get("minId"), "100");

    return new Response(JSON.stringify(mockActivities), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
    });

    const activities = await client.getSpaceActivities({
      count: 10,
      order: "desc",
      minId: 100,
    });

    assertEquals(activities.length, 1);
    assertEquals(activities[0].id, 1);
    assertEquals(activities[0].type, ActivityType.IssueCreated);
  } finally {
    server.close();
  }
});

Deno.test("getSpaceActivities - with activity type filter", async () => {
  const server = createMockServer((req) => {
    const url = new URL(req.url);
    // Array parameters should be formatted as activityTypeId[]=1&activityTypeId[]=2
    const activityTypes = url.searchParams.getAll("activityTypeId[]");
    assertEquals(activityTypes.length, 2);
    assertEquals(activityTypes[0], "1");
    assertEquals(activityTypes[1], "2");

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

    await client.getSpaceActivities({
      activityTypeId: [ActivityType.IssueCreated, ActivityType.IssueUpdated],
    });
  } finally {
    server.close();
  }
});

Deno.test("getSpaceNotification - success", async () => {
  const mockNotification: SpaceNotification = {
    content: "Important announcement",
    updated: "2023-01-01T00:00:00Z",
  };

  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/space/notification");

    return new Response(JSON.stringify(mockNotification), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
    });

    const notification = await client.getSpaceNotification();
    assertEquals(notification.content, "Important announcement");
  } finally {
    server.close();
  }
});

Deno.test("putSpaceNotification - success", async () => {
  const updatedNotification: SpaceNotification = {
    content: "Updated announcement",
    updated: "2023-01-02T00:00:00Z",
  };

  const server = createMockServer(async (req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/space/notification");
    assertEquals(req.method, "PUT");

    const body = await req.json();
    assertEquals(body, { content: "Updated announcement" });

    return new Response(JSON.stringify(updatedNotification), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
    });

    const notification = await client.putSpaceNotification({
      content: "Updated announcement",
    });

    assertEquals(notification.content, "Updated announcement");
  } finally {
    server.close();
  }
});

Deno.test("API error handling - 404", async () => {
  const server = createMockServer(() => {
    return new Response(
      JSON.stringify({
        message: "Resource not found",
        code: 404,
        errors: [
          {
            message: "Space not found",
            code: 6,
          },
        ],
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      },
    );
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
    });

    await assertRejects(
      async () => await client.getSpace(),
      Error,
      "Space not found",
    );
  } finally {
    server.close();
  }
});

Deno.test("API error handling - 401 unauthorized", async () => {
  const server = createMockServer(() => {
    return new Response(
      JSON.stringify({
        message: "Authentication failed",
        code: 401,
        errors: [
          {
            message: "Invalid API key",
            code: 11,
          },
        ],
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: "invalid-key",
    });

    await assertRejects(
      async () => await client.getSpace(),
      Error,
      "Invalid API key",
    );
  } finally {
    server.close();
  }
});

Deno.test({
  name: "API error handling - network error",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    const client = createClient({
      host: "nonexistent.example.com",
      apiKey: "test-key",
      timeout: 1000,
    });

    await assertRejects(async () => await client.getSpace());
  },
});

Deno.test("getSpaceIcon - success", async () => {
  const mockImageData = new Uint8Array([0x89, 0x50, 0x4e, 0x47]); // PNG header

  const server = createMockServer(() => {
    return new Response(mockImageData, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'attachment; filename="logo.png"',
      },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
    });

    const fileData = await client.getSpaceIcon();

    assertEquals(new Uint8Array(fileData.body), mockImageData);
    assertEquals(fileData.fileName, "logo.png");
    assertEquals(fileData.url, `http://${server.host}/api/v2/space/image`);
  } finally {
    server.close();
  }
});
