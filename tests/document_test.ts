import { assertEquals } from "@std/assert";
import { createClient } from "../src/mod.ts";
import type { Document, DocumentTree } from "../src/mod.ts";
import { createMockServer } from "./test_utils.ts";

Deno.test("getDocuments - success", async () => {
  const mockDocuments: Document[] = [
    {
      id: "01939983409c79d5a06a49859789e38f",
      projectId: 1,
      title: "Hello",
      plain: "hello",
      json: "{}",
      statusId: 1,
      emoji: "🎉",
      attachments: [],
      tags: [
        {
          id: 1,
          name: "Backlog",
        },
      ],
      createdUser: {
        id: 2,
        userId: "woody",
        name: "woody",
        roleType: 1,
        lang: "en",
        mailAddress: "woody@nulab.com",
      },
      created: "2024-12-06T01:08:56Z",
      updatedUser: {
        id: 2,
        userId: "woody",
        name: "woody",
        roleType: 1,
        lang: "en",
        mailAddress: "woody@nulab.com",
      },
      updated: "2025-04-28T01:47:02Z",
    },
    {
      id: "0193b335c62173de9547bab5dd0b5324",
      projectId: 1,
      title: "top",
      plain: "hello",
      json: "{}",
      statusId: 1,
      emoji: null,
      attachments: [],
      tags: [],
      createdUser: {
        id: 2,
        userId: "woody",
        name: "woody",
        roleType: 1,
        lang: "en",
        mailAddress: "woody@nulab.com",
      },
      created: "2024-12-06T01:08:56Z",
      updatedUser: {
        id: 2,
        userId: "woody",
        name: "woody",
        roleType: 1,
        lang: "en",
        mailAddress: "woody@nulab.com",
      },
      updated: "2025-04-28T01:47:02Z",
    },
  ];

  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/documents");
    assertEquals(url.searchParams.get("offset"), "0");

    return new Response(JSON.stringify(mockDocuments), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
    });

    const documents = await client.getDocuments({ offset: 0 });

    assertEquals(documents.length, 2);
    assertEquals(documents[0].id, "01939983409c79d5a06a49859789e38f");
    assertEquals(documents[0].title, "Hello");
    assertEquals(documents[1].id, "0193b335c62173de9547bab5dd0b5324");
    assertEquals(documents[1].title, "top");
  } finally {
    server.close();
  }
});

Deno.test("getDocument - success", async () => {
  const mockDocument: Document = {
    id: "0193b335c62173de9547bab5dd0b5324",
    projectId: 1,
    title: "top",
    plain: "hello",
    json: "{}",
    statusId: 1,
    emoji: null,
    attachments: [
      {
        id: 22067,
        name: "test.png",
        size: 8718,
        createdUser: {
          id: 3,
          userId: "woody",
          name: "woody",
          roleType: 2,
          lang: "ja",
          mailAddress: "woody@nulab.com",
        },
        created: "2025-05-29T02:19:54Z",
      },
    ],
    tags: [
      {
        id: 1,
        name: "Backlog",
      },
    ],
    createdUser: {
      id: 2,
      userId: "woody",
      name: "woody",
      roleType: 1,
      lang: "en",
      mailAddress: "woody@nulab.com",
    },
    created: "2024-12-06T01:08:56Z",
    updatedUser: {
      id: 2,
      userId: "woody",
      name: "woody",
      roleType: 1,
      lang: "en",
      mailAddress: "woody@nulab.com",
    },
    updated: "2025-04-28T01:47:02Z",
  };

  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(
      url.pathname,
      "/api/v2/documents/0193b335c62173de9547bab5dd0b5324",
    );

    return new Response(JSON.stringify(mockDocument), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
    });

    const document = await client.getDocument(
      "0193b335c62173de9547bab5dd0b5324",
    );

    assertEquals(document.id, "0193b335c62173de9547bab5dd0b5324");
    assertEquals(document.title, "top");
    assertEquals(document.plain, "hello");
    assertEquals(document.projectId, 1);
    assertEquals(document.attachments.length, 1);
    assertEquals(document.tags.length, 1);
  } finally {
    server.close();
  }
});

Deno.test("getDocumentTree - success", async () => {
  const mockDocumentTree: DocumentTree = {
    projectId: 1,
    activeTree: {
      id: "Active",
      children: [
        {
          id: "01934345404771adb2113d7792bb4351",
          name: "local test",
          children: [
            {
              id: "019347fc760c7b0abff04b44628c94d7",
              name: "test2",
              children: [
                {
                  id: "0192ff5990da76c289dee06b1f11fa01",
                  name: "aaatest234",
                  children: [],
                },
              ],
              emoji: "",
            },
          ],
          emoji: "",
        },
      ],
    },
    trashTree: {
      id: "Trash",
      children: [],
    },
  };

  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/documents/tree");
    assertEquals(url.searchParams.get("projectIdOrKey"), "TEST_PROJECT");

    return new Response(JSON.stringify(mockDocumentTree), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
    });

    const tree = await client.getDocumentTree({
      projectIdOrKey: "TEST_PROJECT",
    });

    assertEquals(tree.projectId, 1);
    assertEquals(tree.activeTree?.id, "Active");
    assertEquals(tree.activeTree?.children.length, 1);
    assertEquals(
      tree.activeTree?.children[0].id,
      "01934345404771adb2113d7792bb4351",
    );
    assertEquals(tree.activeTree?.children[0].name, "local test");
    assertEquals(tree.activeTree?.children[0].children.length, 1);
    assertEquals(tree.trashTree?.id, "Trash");
    assertEquals(tree.trashTree?.children.length, 0);
  } finally {
    server.close();
  }
});

Deno.test("downloadDocumentAttachment - success", async () => {
  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(
      url.pathname,
      "/api/v2/documents/doc-id-123/attachments/456",
    );

    return new Response("file content", {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": 'attachment; filename="test.txt"',
      },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
    });

    const file = await client.downloadDocumentAttachment(
      "doc-id-123",
      456,
    );

    assertEquals(file.fileName, "test.txt");
    const decoder = new TextDecoder();
    assertEquals(decoder.decode(file.body), "file content");
  } finally {
    server.close();
  }
});
Deno.test("addDocument - success", async () => {
  const mockDocument: Document = {
    id: "0193b335c62173de9547bab5dd0b5324",
    projectId: 1,
    title: "top",
    plain: "hello",
    json: "{}",
    statusId: 1,
    emoji: null,
    attachments: [],
    tags: [],
    createdUser: {
      id: 2,
      userId: "woody",
      name: "woody",
      roleType: 1,
      lang: "en",
      mailAddress: "woody@nulab.com",
    },
    created: "2024-12-06T01:08:56Z",
    updatedUser: {
      id: 2,
      userId: "woody",
      name: "woody",
      roleType: 1,
      lang: "en",
      mailAddress: "woody@nulab.com",
    },
    updated: "2025-04-28T01:47:02Z",
  };

  const server = createMockServer(async (req) => {
    const url = new URL(req.url);
    assertEquals(url.pathname, "/api/v2/documents");
    assertEquals(req.method, "POST");

    const body = await req.json();
    assertEquals(body.projectId, 1);
    assertEquals(body.title, "top");
    assertEquals(body.content, "hello");

    return new Response(JSON.stringify(mockDocument), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
    });

    const document = await client.addDocument({
      projectId: 1,
      title: "top",
      content: "hello",
    });

    assertEquals(document.id, "0193b335c62173de9547bab5dd0b5324");
    assertEquals(document.title, "top");
    assertEquals(document.plain, "hello");
    assertEquals(document.projectId, 1);
  } finally {
    server.close();
  }
});
