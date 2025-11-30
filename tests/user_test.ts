import { assertEquals, assertRejects } from "@std/assert";
import { createClient } from "../src/mod.ts";
import type {
  Activity,
  RecentlyViewedIssue,
  RecentlyViewedProject,
  RecentlyViewedWiki,
  Star,
  StarCount,
  User,
} from "../src/entities.ts";
import { ActivityType } from "../src/types.ts";
import { createMockServer } from "./test_utils.ts";

Deno.test("getUsers - success", async () => {
  const mockUsers: User[] = [
    {
      id: 1,
      userId: "admin",
      name: "Admin User",
      roleType: 1,
      lang: "ja",
      mailAddress: "admin@example.com",
    },
    {
      id: 2,
      userId: "user1",
      name: "Test User",
      roleType: 2,
      lang: "ja",
      mailAddress: "user1@example.com",
    },
  ];

  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/users");
    assertEquals(url.searchParams.get("apiKey"), "test-key");

    return new Response(JSON.stringify(mockUsers), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
    });

    const users = await client.getUsers();
    assertEquals(users, mockUsers);
  } finally {
    server.close();
  }
});

Deno.test("getUser - success", async () => {
  const mockUser: User = {
    id: 1,
    userId: "admin",
    name: "Admin User",
    roleType: 1,
    lang: "ja",
    mailAddress: "admin@example.com",
  };

  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/users/1");
    assertEquals(url.searchParams.get("apiKey"), "test-key");

    return new Response(JSON.stringify(mockUser), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
    });

    const user = await client.getUser(1);
    assertEquals(user, mockUser);
  } finally {
    server.close();
  }
});

Deno.test("postUser - success", async () => {
  const mockUser: User = {
    id: 3,
    userId: "newuser",
    name: "New User",
    roleType: 2,
    lang: "ja",
    mailAddress: "newuser@example.com",
  };

  const server = createMockServer(async (req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/users");
    assertEquals(req.method, "POST");

    const body = await req.json();
    assertEquals(body.userId, "newuser");
    assertEquals(body.password, "password123");
    assertEquals(body.name, "New User");
    assertEquals(body.mailAddress, "newuser@example.com");
    assertEquals(body.roleType, 2);

    return new Response(JSON.stringify(mockUser), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
    });

    const user = await client.postUser({
      userId: "newuser",
      password: "password123",
      name: "New User",
      mailAddress: "newuser@example.com",
      roleType: 2,
    });
    assertEquals(user, mockUser);
  } finally {
    server.close();
  }
});

Deno.test("patchUser - success", async () => {
  const mockUser: User = {
    id: 1,
    userId: "admin",
    name: "Updated Admin User",
    roleType: 1,
    lang: "ja",
    mailAddress: "admin@example.com",
  };

  const server = createMockServer(async (req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/users/1");
    assertEquals(req.method, "PATCH");

    const body = await req.json();
    assertEquals(body.name, "Updated Admin User");

    return new Response(JSON.stringify(mockUser), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
    });

    const user = await client.patchUser(1, {
      name: "Updated Admin User",
    });
    assertEquals(user, mockUser);
  } finally {
    server.close();
  }
});

Deno.test("deleteUser - success", async () => {
  const mockUser: User = {
    id: 1,
    userId: "admin",
    name: "Admin User",
    roleType: 1,
    lang: "ja",
    mailAddress: "admin@example.com",
  };

  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/users/1");
    assertEquals(req.method, "DELETE");

    return new Response(JSON.stringify(mockUser), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
    });

    const user = await client.deleteUser(1);
    assertEquals(user, mockUser);
  } finally {
    server.close();
  }
});

Deno.test("getMyself - success", async () => {
  const mockUser: User = {
    id: 1,
    userId: "admin",
    name: "Admin User",
    roleType: 1,
    lang: "ja",
    mailAddress: "admin@example.com",
  };

  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/users/myself");
    assertEquals(url.searchParams.get("apiKey"), "test-key");

    return new Response(JSON.stringify(mockUser), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
    });

    const user = await client.getMyself();
    assertEquals(user, mockUser);
  } finally {
    server.close();
  }
});

Deno.test("getUserIcon - success", async () => {
  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/users/1/icon");

    return new Response(new Uint8Array([1, 2, 3, 4]), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'attachment; filename="icon.png"',
      },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
    });

    const icon = await client.getUserIcon(1);
    assertEquals(icon.fileName, "icon.png");
    assertEquals(icon.url, `http://${server.host}/api/v2/users/1/icon`);
  } finally {
    server.close();
  }
});

Deno.test("getUserActivities - success", async () => {
  const mockActivities: Activity[] = [
    {
      id: 1,
      project: {
        id: 1,
        projectKey: "TEST",
        name: "Test Project",
        chartEnabled: true,
        useResolvedForChart: false,
        subtaskingEnabled: true,
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
        userId: "admin",
        name: "Admin User",
        roleType: 1,
        lang: "ja",
        mailAddress: "admin@example.com",
      },
      created: "2023-01-01T00:00:00Z",
    },
  ];

  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/users/1/activities");
    assertEquals(url.searchParams.get("count"), "10");

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

    const activities = await client.getUserActivities(1, { count: 10 });
    assertEquals(activities, mockActivities);
  } finally {
    server.close();
  }
});

Deno.test("getUserStars - success", async () => {
  const mockStars: Star[] = [
    {
      id: 1,
      comment: "Great work!",
      url: "https://example.backlog.jp/view/TEST-1",
      title: "Test Issue",
      presenter: {
        id: 2,
        userId: "user1",
        name: "Test User",
        roleType: 2,
        lang: "ja",
        mailAddress: "user1@example.com",
      },
      created: "2023-01-01T00:00:00Z",
    },
  ];

  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/users/1/stars");
    assertEquals(url.searchParams.get("count"), "20");

    return new Response(JSON.stringify(mockStars), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
    });

    const stars = await client.getUserStars(1, { count: 20 });
    assertEquals(stars, mockStars);
  } finally {
    server.close();
  }
});

Deno.test("getUserStarsCount - success", async () => {
  const mockStarCount: StarCount = {
    count: 42,
  };

  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/users/1/stars/count");
    assertEquals(url.searchParams.get("since"), "2023-01-01");
    assertEquals(url.searchParams.get("until"), "2023-12-31");

    return new Response(JSON.stringify(mockStarCount), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
    });

    const starCount = await client.getUserStarsCount(1, {
      since: "2023-01-01",
      until: "2023-12-31",
    });
    assertEquals(starCount, mockStarCount);
  } finally {
    server.close();
  }
});

Deno.test("getRecentlyViewedIssues - success", async () => {
  const mockRecentlyViewedIssues: RecentlyViewedIssue[] = [
    {
      issue: {
        id: 1,
        projectId: 1,
        issueKey: "TEST-1",
        keyId: 1,
        issueType: {
          id: 1,
          projectId: 1,
          name: "Bug",
          color: "#990000",
          displayOrder: 0,
        },
        summary: "Test Issue",
        description: "Test description",
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
          userId: "admin",
          name: "Admin User",
          roleType: 1,
          lang: "ja",
          mailAddress: "admin@example.com",
        },
        category: [],
        versions: [],
        milestone: [],
        createdUser: {
          id: 1,
          userId: "admin",
          name: "Admin User",
          roleType: 1,
          lang: "ja",
          mailAddress: "admin@example.com",
        },
        created: "2023-01-01T00:00:00Z",
        updatedUser: {
          id: 1,
          userId: "admin",
          name: "Admin User",
          roleType: 1,
          lang: "ja",
          mailAddress: "admin@example.com",
        },
        updated: "2023-01-01T00:00:00Z",
        customFields: [],
        attachments: [],
        sharedFiles: [],
        stars: [],
      },
      updated: "2023-01-01T00:00:00Z",
    },
  ];

  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/users/myself/recentlyViewedIssues");
    assertEquals(url.searchParams.get("count"), "10");

    return new Response(JSON.stringify(mockRecentlyViewedIssues), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
    });

    const issues = await client.getRecentlyViewedIssues({ count: 10 });
    assertEquals(issues, mockRecentlyViewedIssues);
  } finally {
    server.close();
  }
});

Deno.test("getRecentlyViewedProjects - success", async () => {
  const mockRecentlyViewedProjects: RecentlyViewedProject[] = [
    {
      project: {
        id: 1,
        projectKey: "TEST",
        name: "Test Project",
        chartEnabled: true,
        useResolvedForChart: false,
        subtaskingEnabled: true,
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
      },
      updated: "2023-01-01T00:00:00Z",
    },
  ];

  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/users/myself/recentlyViewedProjects");
    assertEquals(url.searchParams.get("count"), "10");

    return new Response(JSON.stringify(mockRecentlyViewedProjects), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
    });

    const projects = await client.getRecentlyViewedProjects({ count: 10 });
    assertEquals(projects, mockRecentlyViewedProjects);
  } finally {
    server.close();
  }
});

Deno.test("getRecentlyViewedWikis - success", async () => {
  const mockRecentlyViewedWikis: RecentlyViewedWiki[] = [
    {
      page: {
        id: 1,
        projectId: 1,
        name: "Home",
        tags: [],
        createdUser: {
          id: 1,
          userId: "admin",
          name: "Admin User",
          roleType: 1,
          lang: "ja",
          mailAddress: "admin@example.com",
        },
        created: "2023-01-01T00:00:00Z",
        updatedUser: {
          id: 1,
          userId: "admin",
          name: "Admin User",
          roleType: 1,
          lang: "ja",
          mailAddress: "admin@example.com",
        },
        updated: "2023-01-01T00:00:00Z",
      },
      updated: "2023-01-01T00:00:00Z",
    },
  ];

  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/users/myself/recentlyViewedWikis");
    assertEquals(url.searchParams.get("count"), "10");

    return new Response(JSON.stringify(mockRecentlyViewedWikis), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
    });

    const wikis = await client.getRecentlyViewedWikis({ count: 10 });
    assertEquals(wikis, mockRecentlyViewedWikis);
  } finally {
    server.close();
  }
});

Deno.test("getUser - error 404", async () => {
  const server = createMockServer(() => {
    return new Response(
      JSON.stringify({
        errors: [{ message: "User not found", code: 6 }],
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
      async () => {
        await client.getUser(999);
      },
      Error,
      "User not found",
    );
  } finally {
    server.close();
  }
});
