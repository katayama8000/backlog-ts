import { assertEquals } from "@std/assert";
import { createClient } from "../src/mod.ts";
import type { Document } from "../src/mod.ts";
import { createMockServer } from "./test_utils.ts";

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
