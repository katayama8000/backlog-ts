import { assertEquals } from "@std/assert";
import { createClient } from "../src/mod.ts";

Deno.test("createClient creates a client with all methods", () => {
  const client = createClient({
    host: "example.backlog.com",
    apiKey: "test-api-key",
  });

  assertEquals(typeof client.getSpace, "function");
  assertEquals(typeof client.getSpaceActivities, "function");
  assertEquals(typeof client.getSpaceIcon, "function");
  assertEquals(typeof client.getSpaceNotification, "function");
  assertEquals(typeof client.putSpaceNotification, "function");
});

Deno.test("createClient supports OAuth2 token", () => {
  const client = createClient({
    host: "example.backlog.com",
    accessToken: "test-access-token",
  });

  assertEquals(typeof client.getSpace, "function");
});
