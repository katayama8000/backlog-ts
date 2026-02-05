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

Deno.test({
  name: "Integration: getDocument",
  ignore: !isIntegrationTestEnabled,
  async fn() {
    const client = createTestClient();
    const DOCUMENT_ID = Deno.env.get("BACKLOG_DOCUMENT_ID");

    if (!DOCUMENT_ID) {
      console.log("⚠️  BACKLOG_DOCUMENT_ID not set, skipping document test");
      console.log(
        "   Set BACKLOG_DOCUMENT_ID=<document-id> to test document retrieval",
      );
      return;
    }

    // Test with specific document ID
    const document = await client.getDocument(DOCUMENT_ID);

    assertExists(document);
    assertExists(document.id);
    assertExists(document.projectId);
    assertExists(document.title);
    assertEquals(typeof document.id, "string");
    assertEquals(typeof document.projectId, "number");
    assertEquals(typeof document.title, "string");

    console.log("✓ Document:", document.title);
    console.log(`  ID: ${document.id}, Project ID: ${document.projectId}`);
    if (document.tags && document.tags.length > 0) {
      console.log(`  Tags: ${document.tags.map((t) => t.name).join(", ")}`);
    }
    if (document.attachments && document.attachments.length > 0) {
      console.log(`  Attachments: ${document.attachments.length} file(s)`);
    }
  },
});

Deno.test({
  name: "Integration: getDocuments",
  ignore: !isIntegrationTestEnabled,
  async fn() {
    const client = createTestClient();
    const PROJECT_ID_OR_KEY = Deno.env.get("BACKLOG_PROJECT_ID_OR_KEY");

    if (!PROJECT_ID_OR_KEY) {
      console.log(
        "⚠️  BACKLOG_PROJECT_ID_OR_KEY not set, skipping getDocuments test",
      );
      console.log(
        "   Set BACKLOG_PROJECT_ID_OR_KEY=<project-id-or-key> to test document list retrieval",
      );
      return;
    }

    // Get project to verify it exists
    const project = await client.getProject(PROJECT_ID_OR_KEY);
    const projectId = typeof PROJECT_ID_OR_KEY === "string" && isNaN(Number(PROJECT_ID_OR_KEY))
      ? project.id
      : Number(PROJECT_ID_OR_KEY);

    // Get documents for the project
    const documents = await client.getDocuments({
      projectId: [projectId],
      offset: 0,
      count: 5,
    });

    assertExists(documents);
    assertEquals(Array.isArray(documents), true);

    console.log(
      `✓ Retrieved ${documents.length} documents from project ${project.name}`,
    );
    if (documents.length > 0) {
      console.log(
        `  First document: "${documents[0].title}" (ID: ${documents[0].id})`,
      );
    }
  },
});

Deno.test({
  name: "Integration: getDocumentTree",
  ignore: !isIntegrationTestEnabled,
  async fn() {
    const client = createTestClient();
    const PROJECT_ID_OR_KEY = Deno.env.get("BACKLOG_PROJECT_ID_OR_KEY");

    if (!PROJECT_ID_OR_KEY) {
      console.log(
        "⚠️  BACKLOG_PROJECT_ID_OR_KEY not set, skipping getDocumentTree test",
      );
      console.log(
        "   Set BACKLOG_PROJECT_ID_OR_KEY=<project-id-or-key> to test document tree retrieval",
      );
      return;
    }

    // Get document tree for the project
    const tree = await client.getDocumentTree({
      projectIdOrKey: PROJECT_ID_OR_KEY,
    });

    assertExists(tree);
    assertExists(tree.projectId);
    assertEquals(typeof tree.projectId, "number");

    console.log(`✓ Retrieved document tree for project ${tree.projectId}`);

    if (tree.activeTree) {
      const countNodes = (nodes: typeof tree.activeTree.children): number => {
        return nodes.reduce((sum, node) => sum + 1 + countNodes(node.children), 0);
      };
      const activeCount = countNodes(tree.activeTree.children);
      console.log(`  Active documents: ${activeCount}`);

      if (tree.activeTree.children.length > 0) {
        const firstNode = tree.activeTree.children[0];
        console.log(`  First node: "${firstNode.name}" (ID: ${firstNode.id})`);
      }
    }

    if (tree.trashTree) {
      const trashCount = tree.trashTree.children.length;
      console.log(`  Trash documents: ${trashCount}`);
    }
  },
});

Deno.test({
  name: "Integration: downloadDocumentAttachment",
  ignore: !isIntegrationTestEnabled,
  async fn() {
    const client = createTestClient();
    const DOCUMENT_ID = Deno.env.get("BACKLOG_DOCUMENT_ID");
    const ATTACHMENT_ID = Deno.env.get("BACKLOG_ATTACHMENT_ID");

    if (!DOCUMENT_ID || !ATTACHMENT_ID) {
      console.log(
        "⚠️  BACKLOG_DOCUMENT_ID and BACKLOG_ATTACHMENT_ID must be set for this test, skipping.",
      );
      return;
    }

    const file = await client.downloadDocumentAttachment(
      DOCUMENT_ID,
      parseInt(ATTACHMENT_ID, 10),
    );

    assertExists(file);
    assertExists(file.body);
    assertExists(file.fileName);
    assertEquals(file.body instanceof ArrayBuffer, true);
    console.log(
      `✓ Downloaded attachment "${file.fileName}" (${(file.body.byteLength / 1024).toFixed(2)} KB)`,
    );
  },
});

Deno.test({
  name: "Integration: addDocument (write test)",
  ignore: !isIntegrationTestEnabled || !allowWriteTests,
  async fn() {
    console.log("\n🚨 Writing data to Backlog API (addDocument)...");
    const client = createTestClient();
    const PROJECT_ID_OR_KEY = Deno.env.get("BACKLOG_PROJECT_ID_OR_KEY");

    if (!PROJECT_ID_OR_KEY) {
      console.log(
        "⚠️  BACKLOG_PROJECT_ID_OR_KEY not set, skipping addDocument test",
      );
      return;
    }

    const project = await client.getProject(PROJECT_ID_OR_KEY);
    const projectId = typeof PROJECT_ID_OR_KEY === "string" && isNaN(Number(PROJECT_ID_OR_KEY))
      ? project.id
      : Number(PROJECT_ID_OR_KEY);

    const uniqueTitle = `Test Document from Gemini - ${new Date().toISOString()}`;
    const documentContent = "This is a test document created by Gemini in an E2E test.";

    const newDocument = await client.addDocument({
      projectId: projectId,
      title: uniqueTitle,
      content: documentContent,
      emoji: "📝",
      addLast: true,
    });

    assertExists(newDocument);
    assertEquals(newDocument.title, uniqueTitle);
    assertEquals(newDocument.plain, documentContent);
    assertEquals(newDocument.emoji, "📝");
    console.log(`✓ Added document: "${newDocument.title}" (ID: ${newDocument.id})`);
  },
});
