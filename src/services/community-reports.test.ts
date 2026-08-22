import { describe, expect, it } from "vitest";
import { mapCommunityReportRows } from "./community-reports";

const now = new Date("2026-08-22T10:00:00.000Z");

describe("community report aggregation", () => {
  it("groups the same report and counts distinct anonymous reporters", () => {
    const reports = mapCommunityReportRows(
      [
        {
          id: "report-1",
          category: "water",
          detail: "Mare mosso",
          created_at: "2026-08-22T09:55:00.000Z",
          reporter_id: "11111111-1111-4111-8111-111111111111",
        },
        {
          id: "report-2",
          category: "water",
          detail: "Mare mosso",
          created_at: "2026-08-22T09:50:00.000Z",
          reporter_id: "22222222-2222-4222-8222-222222222222",
        },
        {
          id: "report-3",
          category: "water",
          detail: "Acqua limpida",
          created_at: "2026-08-22T09:40:00.000Z",
          reporter_id: "11111111-1111-4111-8111-111111111111",
        },
      ],
      now,
    );

    expect(reports).toEqual([
      expect.objectContaining({
        id: "report-1",
        title: "Acqua",
        detail: "Mare mosso",
        confirmations: 2,
        age: "5 min fa",
      }),
      expect.objectContaining({
        id: "report-3",
        detail: "Acqua limpida",
        confirmations: 1,
        age: "20 min fa",
      }),
    ]);
  });

  it("keeps legacy rows countable while their reporter identity is unknown", () => {
    const reports = mapCommunityReportRows(
      [
        {
          id: "legacy-1",
          category: "crowding",
          detail: "Spiaggia affollata",
          created_at: "2026-08-22T09:58:00.000Z",
          reporter_id: null,
        },
        {
          id: "legacy-2",
          category: "crowding",
          detail: "Spiaggia affollata",
          created_at: "2026-08-22T09:57:00.000Z",
          reporter_id: null,
        },
      ],
      now,
    );

    expect(reports[0]).toMatchObject({ confirmations: 2 });
  });
});
