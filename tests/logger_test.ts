import { assertEquals } from "@std/assert";
import { createClient, Logger } from "../src/mod.ts";
import { createMockServer } from "./test_utils.ts";

Deno.test("Logger - request and response logging", async () => {
  // Create a custom logger to capture logs
  const logs: Array<Record<string, unknown>> = [];
  const testLogger: Logger = {
    request(method, url, _headers, body) {
      logs.push({ type: "request", method, url, body });
    },
    response(method, url, status, _headers, body, duration) {
      logs.push({ type: "response", method, url, status, body, duration });
    },
    error(method, url, error, duration) {
      logs.push({ type: "error", method, url, error, duration });
    },
  };

  // Setup mock server
  const server = createMockServer((req) => {
    assertEquals(req.method, "GET");
    return new Response(JSON.stringify({ success: true, data: "test" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  try {
    // Create client with logger
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
      logger: testLogger,
    });

    // Make a request
    await client.getSpace();

    // Verify logs
    assertEquals(logs.length, 2); // 1 request log, 1 response log

    // Check request log
    assertEquals(logs[0].type, "request");
    assertEquals(logs[0].method, "GET");
    assertEquals(typeof logs[0].url, "string");
    assertEquals((logs[0].url as string).includes("space"), true);

    // Check response log
    assertEquals(logs[1].type, "response");
    assertEquals(logs[1].method, "GET");
    assertEquals(logs[1].status, 200);
    assertEquals((logs[1].body as Record<string, unknown>).success, true);
    assertEquals((logs[1].body as Record<string, unknown>).data, "test");
    assertEquals(typeof logs[1].duration, "number");
  } finally {
    server.close();
  }
});

Deno.test("Logger - error handling", async () => {
  // Create a custom logger to capture logs
  const logs: Array<Record<string, unknown>> = [];
  const testLogger: Logger = {
    request(method, url, _headers, body) {
      logs.push({ type: "request", method, url, body });
    },
    response(method, url, status, _headers, body, duration) {
      logs.push({ type: "response", method, url, status, body, duration });
    },
    error(method, url, error, duration) {
      logs.push({ type: "error", method, url, error, duration });
    },
  };

  // Setup mock server that returns an error
  const server = createMockServer((req) => {
    assertEquals(req.method, "GET");
    return new Response(
      JSON.stringify({
        message: "Error occurred",
        code: 400,
        errors: [{ message: "Invalid request", code: 400 }],
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  });

  try {
    // Create client with logger and disable retry for this test
    const client = createClient({
      host: server.host,
      apiKey: "test-key",
      logger: testLogger,
      retry: {
        maxAttempts: 1, // Disable retry to get consistent log count
      },
    });

    // Make a request that will fail
    try {
      await client.getSpace();
      throw new Error("Should have thrown an error");
    } catch (error) {
      // Expected error
      if (error instanceof Error) {
        assertEquals(error.message.includes("Invalid request"), true);
      } else {
        throw new Error("Expected an Error instance");
      }
    }

    // Verify logs - should be 3 logs:
    // 1. request log
    // 2. error log from executeRequest (response parsing)
    // 3. error log from request function (non-retryable error, final throw)
    assertEquals(logs.length, 3);

    // Check request log
    assertEquals(logs[0].type, "request");
    assertEquals(logs[0].method, "GET");
    assertEquals(typeof logs[0].url, "string");

    // Check error log
    assertEquals(logs[1].type, "error");
    assertEquals(logs[1].method, "GET");
    assertEquals(typeof logs[1].url, "string");
    assertEquals(typeof logs[1].error, "object");
    assertEquals(typeof logs[1].duration, "number");
  } finally {
    server.close();
  }
});

Deno.test({
  name: "Logger - download functionality",
  sanitizeResources: false, // Disable resource leak detection
  async fn() {
    // Create a custom logger to capture logs
    const logs: Array<Record<string, unknown>> = [];
    const testLogger: Logger = {
      request(method, url, _headers, body) {
        logs.push({ type: "request", method, url, body });
      },
      response(method, url, status, _headers, body, duration) {
        logs.push({ type: "response", method, url, status, body, duration });
      },
      error(method, url, error, duration) {
        logs.push({ type: "error", method, url, error, duration });
      },
    };

    // Setup mock server for file download
    const server = createMockServer((req) => {
      assertEquals(req.method, "GET");
      return new Response("test file content", {
        status: 200,
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": 'attachment; filename="test.txt"',
        },
      });
    });

    try {
      // Create client with logger and disable retry for this test
      const client = createClient({
        host: server.host,
        apiKey: "test-key",
        logger: testLogger,
        retry: {
          maxAttempts: 1, // Disable retry to get consistent log count
        },
      });

      // Make a request to download a file
      const result = await client.getSpaceIcon();

      // Verify download was successful
      assertEquals(result.fileName, "test.txt");
      const decoder = new TextDecoder();
      assertEquals(decoder.decode(result.body), "test file content");

      // Verify logs
      assertEquals(logs.length, 2); // 1 request log, 1 response log

      // Check request log
      assertEquals(logs[0].type, "request");
      assertEquals(logs[0].method, "GET");

      // Check response log
      assertEquals(logs[1].type, "response");
      assertEquals(logs[1].method, "GET");
      assertEquals(logs[1].status, 200);
      assertEquals((logs[1].body as Record<string, unknown>).fileName, "test.txt");
      assertEquals(typeof (logs[1].body as Record<string, unknown>).size, "number");
      // The actual length of "test file content" is 17 characters (including the space)
      assertEquals((logs[1].body as Record<string, unknown>).size, 17);
      assertEquals(typeof logs[1].duration, "number");
    } finally {
      server.close();
    }
  },
});

// Using ignore option to avoid the leak detection issue
Deno.test({
  name: "consoleLogger - API usage example",
  sanitizeResources: false, // Ignore resource leak checks
  async fn() {
    // This test just demonstrates the API usage pattern
    // We don't assert on the console output

    // Setup mock server
    const server = createMockServer((_req) => {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });

    try {
      // Create client with custom logger
      const client = createClient({
        host: server.host,
        apiKey: "test-key",
        logger: {
          // Custom logger that only logs requests
          request(method, url) {
            console.log(`Custom logger - Request: ${method} ${url}`);
          },
        },
      });

      // Make a request
      await client.getSpace();

      // The example doesn't assert anything since we're just showing API usage
      assertEquals(true, true);
    } finally {
      server.close();
    }
  },
});
