import { describe, expect, it } from "vitest";

import { applyPublicBeachPublicationFilter } from "./server";

type RecordedOperation =
  | { method: "eq"; args: [column: string, value: boolean] }
  | { method: "in"; args: [column: string, values: string[]] };

function createBeachQueryRecorder() {
  const operations: RecordedOperation[] = [];
  const query = {
    eq(column: string, value: boolean) {
      operations.push({ method: "eq", args: [column, value] });
      return query;
    },
    in(column: string, values: string[]) {
      operations.push({ method: "in", args: [column, values] });
      return query;
    },
  };

  return { operations, query };
}

describe("public beach query filter", () => {
  it("adds both the published gate and the verified-or-stale publication gate", () => {
    const { operations, query } = createBeachQueryRecorder();

    expect(applyPublicBeachPublicationFilter(query)).toBe(query);
    expect(operations).toEqual([
      { method: "eq", args: ["is_published", true] },
      { method: "in", args: ["publication_status", ["verified", "stale"]] },
    ]);
  });
});
