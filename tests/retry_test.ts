import { assertEquals, assertRejects } from "@std/assert";
import { createClient } from "../src/mod.ts";
import type { BacklogConfig } from "../src/config.ts";

/**
 * Mock server for testing retry logic
 */
class RetryMockServer {
  private port: number;
  private server: Deno.HttpServer | null = null;
  private requestCount = 0;

  constructor(port = 8899) {
    this.port = port;
  }

  /**
   * Start the mock server
   */
  start(options: {
    failureCount: number;
    statusCode?: number;
    delayMs?: number;
  }) {
    this.requestCount = 0;

    const handler = async (_request: Request): Promise<Response> => {
      this.requestCount++;

      // Add delay if specified
      if (options.delayMs) {
        await new Promise((resolve) => setTimeout(resolve, options.delayMs));
      }

      // Fail for the first N requests
      if (this.requestCount <= options.failureCount) {
        const statusCode = options.statusCode || 500;
        return new Response(
          JSON.stringify({
            message: `Mock error ${this.requestCount}`,
            code: statusCode,
          }),
          {
            status: statusCode,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Success response
      return new Response(
        JSON.stringify({
          spaceKey: "TEST",
          name: "Test Space",
          ownerId: 1,
          lang: "ja",
          timezone: "Asia/Tokyo",
          reportSendTime: "09:00",
          textFormattingRule: "markdown",
          created: "2023-01-01T00:00:00Z",
          updated: "2023-01-01T00:00:00Z",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    };

    this.server = Deno.serve({ port: this.port, hostname: "localhost" }, handler);
  }

  /**
   * Stop the mock server
   */
  async stop() {
    if (this.server) {
      await this.server.shutdown();
      this.server = null;
    }
  }

  /**
   * Get the number of requests received
   */
  getRequestCount(): number {
    return this.requestCount;
  }
}

Deno.test("Retry logic - successful retry after failure", async () => {
  const server = new RetryMockServer();

  try {
    // Start server that fails once, then succeeds
    server.start({ failureCount: 1, statusCode: 500 });

    const config: BacklogConfig = {
      host: "localhost:8899",
      apiKey: "test-api-key",
      retry: {
        maxAttempts: 3,
        baseDelay: 100, // Short delay for tests
        exponentialBackoff: false,
      },
    };

    const client = createClient(config);
    const result = await client.getSpace();

    assertEquals(result.spaceKey, "TEST");
    assertEquals(result.name, "Test Space");
    assertEquals(server.getRequestCount(), 2); // Failed once, succeeded on retry
  } finally {
    await server.stop();
  }
});

Deno.test("Retry logic - exhausts retry attempts", async () => {
  const server = new RetryMockServer();

  try {
    // Start server that always fails with 500
    server.start({ failureCount: 10, statusCode: 500 });

    const config: BacklogConfig = {
      host: "localhost:8899",
      apiKey: "test-api-key",
      retry: {
        maxAttempts: 3,
        baseDelay: 100,
        exponentialBackoff: false,
        retryableStatusCodes: [500],
      },
    };

    const client = createClient(config);

    await assertRejects(
      () => client.getSpace(),
      Error,
      "Mock error",
    );

    assertEquals(server.getRequestCount(), 3); // Should try 3 times
  } finally {
    await server.stop();
  }
});

Deno.test("Retry logic - non-retryable status code", async () => {
  const server = new RetryMockServer();

  try {
    // Start server that always fails with 404 (non-retryable by default)
    server.start({ failureCount: 10, statusCode: 404 });

    const config: BacklogConfig = {
      host: "localhost:8899",
      apiKey: "test-api-key",
      retry: {
        maxAttempts: 3,
        baseDelay: 100,
        exponentialBackoff: false,
      },
    };

    const client = createClient(config);

    await assertRejects(
      () => client.getSpace(),
      Error,
      "Mock error",
    );

    assertEquals(server.getRequestCount(), 1); // Should not retry
  } finally {
    await server.stop();
  }
});

Deno.test("Retry logic - retry on rate limiting (429)", async () => {
  const server = new RetryMockServer();

  try {
    // Start server that fails twice with 429, then succeeds
    server.start({ failureCount: 2, statusCode: 429 });

    const config: BacklogConfig = {
      host: "localhost:8899",
      apiKey: "test-api-key",
      retry: {
        maxAttempts: 3,
        baseDelay: 100,
        exponentialBackoff: false,
      },
    };

    const client = createClient(config);
    const result = await client.getSpace();

    assertEquals(result.spaceKey, "TEST");
    assertEquals(result.name, "Test Space");
    assertEquals(server.getRequestCount(), 3); // Failed twice, succeeded on third attempt
  } finally {
    await server.stop();
  }
});

Deno.test("Retry logic - exponential backoff", async () => {
  const server = new RetryMockServer();

  try {
    // Start server that fails twice, then succeeds
    server.start({ failureCount: 2, statusCode: 500 });

    const config: BacklogConfig = {
      host: "localhost:8899",
      apiKey: "test-api-key",
      retry: {
        maxAttempts: 3,
        baseDelay: 100,
        exponentialBackoff: true,
        maxDelay: 1000,
      },
    };

    const startTime = performance.now();
    const client = createClient(config);
    const result = await client.getSpace();
    const duration = performance.now() - startTime;

    assertEquals(result.spaceKey, "TEST");
    assertEquals(result.name, "Test Space");
    assertEquals(server.getRequestCount(), 3);

    // Should take at least 100ms (first retry) + 200ms (second retry)
    // We allow some margin for test timing variability
    if (duration < 250) {
      throw new Error(`Expected duration >= 250ms, got ${duration}ms`);
    }
  } finally {
    await server.stop();
  }
});

Deno.test("Retry logic - custom retryable status codes", async () => {
  const server = new RetryMockServer();

  try {
    // Start server that fails with 418 (I'm a teapot)
    server.start({ failureCount: 1, statusCode: 418 });

    const config: BacklogConfig = {
      host: "localhost:8899",
      apiKey: "test-api-key",
      retry: {
        maxAttempts: 3,
        baseDelay: 100,
        exponentialBackoff: false,
        retryableStatusCodes: [418, 500], // Include 418 as retryable
      },
    };

    const client = createClient(config);
    const result = await client.getSpace();

    assertEquals(result.spaceKey, "TEST");
    assertEquals(result.name, "Test Space");
    assertEquals(server.getRequestCount(), 2); // Should retry on 418
  } finally {
    await server.stop();
  }
});

Deno.test("Retry logic - disabled (maxAttempts = 1)", async () => {
  const server = new RetryMockServer();

  try {
    // Start server that always fails
    server.start({ failureCount: 10, statusCode: 500 });

    const config: BacklogConfig = {
      host: "localhost:8899",
      apiKey: "test-api-key",
      retry: {
        maxAttempts: 1, // Disable retry
      },
    };

    const client = createClient(config);

    await assertRejects(
      () => client.getSpace(),
      Error,
      "Mock error",
    );

    assertEquals(server.getRequestCount(), 1); // Should not retry
  } finally {
    await server.stop();
  }
});
