import { assertEquals, assertExists } from "@std/assert";
import { load } from "@std/dotenv";
import { createClient } from "../src/mod.ts";

/**
 * Integration tests for Backlog API
 *
 * These tests require actual Backlog API credentials set in environment variables:
 * - BACKLOG_HOST: Your Backlog space host (e.g., "your-space.backlog.com")
 * - BACKLOG_API_KEY: Your API key OR BACKLOG_ACCESS_TOKEN: Your OAuth2 access token
 *
 * Run with:
 *   deno task test:integration
 *
 * Or set environment variables manually:
 *   BACKLOG_HOST=your-space.backlog.com BACKLOG_API_KEY=your-key deno task test:integration
 *
 * These tests are skipped if environment variables are not set.
 */

// Load .env file if it exists
await load({ export: true, envPath: ".env" });

const BACKLOG_HOST = Deno.env.get("BACKLOG_HOST");
const BACKLOG_API_KEY = Deno.env.get("BACKLOG_API_KEY");
const BACKLOG_ACCESS_TOKEN = Deno.env.get("BACKLOG_ACCESS_TOKEN");

const isIntegrationTestEnabled = BACKLOG_HOST && (BACKLOG_API_KEY || BACKLOG_ACCESS_TOKEN);

// Show warning when integration tests are enabled
if (isIntegrationTestEnabled) {
  console.log("\n⚠️  WARNING: Integration tests are enabled!");
  console.log(`📡 Real API calls will be made to: ${BACKLOG_HOST}`);
  console.log("💡 These tests will READ data from your Backlog space.\n");
}

function createTestClient() {
  if (!BACKLOG_HOST) {
    throw new Error("BACKLOG_HOST environment variable is not set");
  }

  if (BACKLOG_API_KEY) {
    return createClient({
      host: BACKLOG_HOST,
      apiKey: BACKLOG_API_KEY,
    });
  }

  if (BACKLOG_ACCESS_TOKEN) {
    return createClient({
      host: BACKLOG_HOST,
      accessToken: BACKLOG_ACCESS_TOKEN,
    });
  }

  throw new Error("Either BACKLOG_API_KEY or BACKLOG_ACCESS_TOKEN must be set");
}

Deno.test({
  name: "Integration: getSpace",
  ignore: !isIntegrationTestEnabled,
  async fn() {
    const client = createTestClient();
    const space = await client.getSpace();

    assertExists(space);
    assertExists(space.spaceKey);
    assertExists(space.name);
    assertExists(space.ownerId);
    assertEquals(typeof space.spaceKey, "string");
    assertEquals(typeof space.name, "string");
    assertEquals(typeof space.ownerId, "number");

    console.log("✓ Space:", space.spaceKey, "-", space.name);
  },
});

Deno.test({
  name: "Integration: getSpaceActivities",
  ignore: !isIntegrationTestEnabled,
  async fn() {
    const client = createTestClient();
    const activities = await client.getSpaceActivities({
      count: 5,
      order: "desc",
    });

    assertExists(activities);
    assertEquals(Array.isArray(activities), true);

    if (activities.length > 0) {
      const activity = activities[0];
      assertExists(activity.id);
      assertExists(activity.type);
      assertExists(activity.createdUser);
      assertEquals(typeof activity.id, "number");
      assertEquals(typeof activity.type, "number");

      console.log(`✓ Retrieved ${activities.length} activities`);
      console.log(
        `  Latest activity: ID=${activity.id}, Type=${activity.type}`,
      );
    } else {
      console.log("✓ No activities found (this is okay)");
    }
  },
});

Deno.test({
  name: "Integration: getSpaceActivities with activity type filter",
  ignore: !isIntegrationTestEnabled,
  async fn() {
    const client = createTestClient();
    const activities = await client.getSpaceActivities({
      activityTypeId: [1, 2, 3], // IssueCreated, IssueUpdated, IssueCommented
      count: 10,
      order: "desc",
    });

    assertExists(activities);
    assertEquals(Array.isArray(activities), true);

    // Verify all activities match the requested types
    for (const activity of activities) {
      assertEquals(
        [1, 2, 3].includes(activity.type),
        true,
        `Activity type ${activity.type} should be in [1, 2, 3]`,
      );
    }

    console.log(`✓ Retrieved ${activities.length} filtered activities`);
  },
});

Deno.test({
  name: "Integration: getSpaceNotification",
  ignore: !isIntegrationTestEnabled,
  async fn() {
    const client = createTestClient();
    const notification = await client.getSpaceNotification();

    assertExists(notification);
    // content can be empty string, so just check it exists
    assertExists(notification.content !== undefined);
    assertEquals(typeof notification.content, "string");
    // updated can be null in some cases
    if (notification.updated) {
      assertEquals(typeof notification.updated, "string");
    }

    console.log("✓ Space notification:", notification.content || "(empty)");
  },
});

Deno.test({
  name: "Integration: getSpaceIcon",
  ignore: !isIntegrationTestEnabled,
  async fn() {
    const client = createTestClient();
    const icon = await client.getSpaceIcon();

    assertExists(icon);
    assertExists(icon.body);
    assertExists(icon.url);
    assertEquals(icon.body instanceof ArrayBuffer, true);
    assertEquals(typeof icon.url, "string");

    const sizeInKB = (icon.body.byteLength / 1024).toFixed(2);
    console.log(`✓ Space icon downloaded: ${sizeInKB} KB`);
    if (icon.fileName) {
      console.log(`  Filename: ${icon.fileName}`);
    }
  },
});

Deno.test({
  name: "Integration: pagination test",
  ignore: !isIntegrationTestEnabled,
  async fn() {
    const client = createTestClient();

    // Get first page
    const firstPage = await client.getSpaceActivities({
      count: 2,
      order: "desc",
    });

    if (firstPage.length === 0) {
      console.log("✓ No activities to test pagination");
      return;
    }

    // Get second page using maxId
    const maxId = firstPage[firstPage.length - 1].id - 1;
    const secondPage = await client.getSpaceActivities({
      count: 2,
      order: "desc",
      maxId: maxId,
    });

    // Verify pages don't overlap
    const firstPageIds = firstPage.map((a) => a.id);
    const secondPageIds = secondPage.map((a) => a.id);

    for (const id of secondPageIds) {
      assertEquals(
        firstPageIds.includes(id),
        false,
        "Pages should not overlap",
      );
    }

    console.log(`✓ Pagination working correctly`);
    console.log(`  First page: ${firstPageIds.join(", ")}`);
    console.log(`  Second page: ${secondPageIds.join(", ")}`);
  },
});

// Note: This test modifies data, so it's disabled by default
// Set BACKLOG_ALLOW_WRITE_TESTS=true to enable
const allowWriteTests = Deno.env.get("BACKLOG_ALLOW_WRITE_TESTS") === "true";

// Show additional warning when write tests are enabled
if (isIntegrationTestEnabled && allowWriteTests) {
  console.log("🚨 CRITICAL WARNING: Write tests are ENABLED!");
  console.log("✏️  These tests will MODIFY data in your Backlog space!");
  console.log("⚠️  Make sure you are using a test/development space.\n");
}

Deno.test({
  name: "Integration: putSpaceNotification (write test)",
  ignore: !isIntegrationTestEnabled || !allowWriteTests,
  async fn() {
    console.log("\n🚨 Writing data to Backlog API...");
    const client = createTestClient();

    // Get current notification
    const current = await client.getSpaceNotification();
    console.log("  Current notification:", current.content);

    // Update notification
    const testMessage = `[Test] Updated at ${new Date().toISOString()}`;
    const updated = await client.putSpaceNotification({
      content: testMessage,
    });

    assertExists(updated);
    assertEquals(updated.content, testMessage);
    console.log("✓ Updated notification:", updated.content);

    // Restore original notification
    await client.putSpaceNotification({
      content: current.content,
    });
    console.log("  Restored original notification");
  },
});
