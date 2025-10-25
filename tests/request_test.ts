import { assertEquals, assertRejects } from "@std/assert";
import { download, request } from "../src/request.ts";
import type { BacklogConfig } from "../src/config.ts";

function createMockServer(
  handler: (req: Request) => Response | Promise<Response>,
) {
  const ac = new AbortController();
  const server = Deno.serve(
    {
      port: 0,
      signal: ac.signal,
      onListen: () => {},
    },
    handler,
  );

  return {
    get host() {
      return `localhost:${(server.addr as Deno.NetAddr).port}`;
    },
    close: () => ac.abort(),
  };
}

Deno.test("request - GET with query parameters", async () => {
  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.searchParams.get("foo"), "bar");
    assertEquals(url.searchParams.get("count"), "10");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const config: BacklogConfig = {
      host: server.host,
      apiKey: "test-key",
    };

    const result = await request<{ success: boolean }>(config, "test", {
      params: { foo: "bar", count: 10 },
    });

    assertEquals(result.success, true);
  } finally {
    server.close();
  }
});

Deno.test("request - POST with body", async () => {
  const server = createMockServer(async (req) => {
    assertEquals(req.method, "POST");
    const body = await req.json();
    assertEquals(body, { name: "Test", value: 123 });

    return new Response(JSON.stringify({ id: 1 }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const config: BacklogConfig = {
      host: server.host,
      apiKey: "test-key",
    };

    const result = await request<{ id: number }>(config, "test", {
      method: "POST",
      body: { name: "Test", value: 123 },
    });

    assertEquals(result.id, 1);
  } finally {
    server.close();
  }
});

Deno.test("request - PUT method", async () => {
  const server = createMockServer(async (req) => {
    assertEquals(req.method, "PUT");
    const body = await req.json();
    assertEquals(body.content, "Updated");

    return new Response(JSON.stringify({ updated: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const config: BacklogConfig = {
      host: server.host,
      apiKey: "test-key",
    };

    const result = await request<{ updated: boolean }>(config, "test", {
      method: "PUT",
      body: { content: "Updated" },
    });

    assertEquals(result.updated, true);
  } finally {
    server.close();
  }
});

Deno.test("request - DELETE method", async () => {
  const server = createMockServer((req) => {
    assertEquals(req.method, "DELETE");

    return new Response(JSON.stringify({ deleted: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const config: BacklogConfig = {
      host: server.host,
      apiKey: "test-key",
    };

    const result = await request<{ deleted: boolean }>(config, "test/1", {
      method: "DELETE",
    });

    assertEquals(result.deleted, true);
  } finally {
    server.close();
  }
});

Deno.test("request - array parameters", async () => {
  const server = createMockServer((req) => {
    const url = new URL(req.url);
    const ids = url.searchParams.getAll("id[]");
    assertEquals(ids.length, 3);
    assertEquals(ids, ["1", "2", "3"]);

    return new Response(JSON.stringify({ count: 3 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const config: BacklogConfig = {
      host: server.host,
      apiKey: "test-key",
    };

    const result = await request<{ count: number }>(config, "test", {
      params: { id: [1, 2, 3] },
    });

    assertEquals(result.count, 3);
  } finally {
    server.close();
  }
});

Deno.test("request - OAuth2 token in header", async () => {
  const server = createMockServer((req) => {
    const authHeader = req.headers.get("Authorization");
    assertEquals(authHeader, "Bearer my-access-token");

    return new Response(JSON.stringify({ authenticated: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const config: BacklogConfig = {
      host: server.host,
      accessToken: "my-access-token",
    };

    const result = await request<{ authenticated: boolean }>(config, "test");
    assertEquals(result.authenticated, true);
  } finally {
    server.close();
  }
});

Deno.test({
  name: "request - timeout",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    const server = createMockServer(async () => {
      // Wait longer than timeout
      await new Promise((resolve) => setTimeout(resolve, 500));
      return new Response(JSON.stringify({}), { status: 200 });
    });

    try {
      const config: BacklogConfig = {
        host: server.host,
        apiKey: "test-key",
        timeout: 100, // 100ms timeout
      };

      await assertRejects(async () => await request(config, "test"));
    } finally {
      server.close();
      // Wait for all pending operations to complete
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  },
});

Deno.test("request - null and undefined parameters are omitted", async () => {
  const server = createMockServer((req) => {
    const url = new URL(req.url);
    assertEquals(url.searchParams.has("nullParam"), false);
    assertEquals(url.searchParams.has("undefinedParam"), false);
    assertEquals(url.searchParams.get("validParam"), "value");

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    const config: BacklogConfig = {
      host: server.host,
      apiKey: "test-key",
    };

    await request(config, "test", {
      params: {
        nullParam: null,
        undefinedParam: undefined,
        validParam: "value",
      },
    });
  } finally {
    server.close();
  }
});

Deno.test("download - success with filename", async () => {
  const mockData = new Uint8Array([1, 2, 3, 4, 5]);

  const server = createMockServer(() => {
    return new Response(mockData, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": 'attachment; filename="test-file.bin"',
      },
    });
  });

  try {
    const config: BacklogConfig = {
      host: server.host,
      apiKey: "test-key",
    };

    const result = await download(config, "files/123");

    assertEquals(new Uint8Array(result.body), mockData);
    assertEquals(result.fileName, "test-file.bin");
  } finally {
    server.close();
  }
});

Deno.test("download - success without filename", async () => {
  const mockData = new Uint8Array([1, 2, 3]);

  const server = createMockServer(() => {
    return new Response(mockData, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
      },
    });
  });

  try {
    const config: BacklogConfig = {
      host: server.host,
      apiKey: "test-key",
    };

    const result = await download(config, "image");

    assertEquals(new Uint8Array(result.body), mockData);
    assertEquals(result.fileName, undefined);
  } finally {
    server.close();
  }
});

Deno.test("download - error handling", async () => {
  const server = createMockServer(() => {
    return new Response(
      JSON.stringify({
        message: "File not found",
        errors: [{ message: "The file does not exist", code: 10 }],
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      },
    );
  });

  try {
    const config: BacklogConfig = {
      host: server.host,
      apiKey: "test-key",
    };

    await assertRejects(
      async () => await download(config, "files/999"),
      Error,
      "The file does not exist",
    );
  } finally {
    server.close();
  }
});
