import { assertEquals } from "@std/assert";
import type { GetActivitiesParams } from "../src/params.ts";
import { ActivityType } from "../src/types.ts";

Deno.test("GetActivitiesParams structure", () => {
  const params: GetActivitiesParams = {
    activityTypeId: [ActivityType.IssueCreated, ActivityType.IssueUpdated],
    minId: 1,
    maxId: 100,
    count: 20,
    order: "desc",
  };

  assertEquals(params.minId, 1);
  assertEquals(params.maxId, 100);
  assertEquals(params.count, 20);
  assertEquals(params.order, "desc");
  assertEquals(params.activityTypeId?.length, 2);
});
