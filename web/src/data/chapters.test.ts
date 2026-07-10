import { describe, expect, it } from "vitest";
import { chapters } from "./chapters";

describe("chapter demo catalog", () => {
  it("keeps only the curated recorded-data labs", () => {
    expect(chapters).toHaveLength(14);
    expect(chapters.map((chapter) => chapter.demos.length)).toEqual([
      0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0,
    ]);

    const demos = chapters.flatMap((chapter) => chapter.demos);
    expect(demos).toHaveLength(8);
    expect(new Set(demos.map((demo) => demo.id)).size).toBe(demos.length);
    expect(new Set(demos.map((demo) => demo.kind)).size).toBe(demos.length);
    expect(demos.map((demo) => demo.kind)).toEqual([
      "comma-sensor-evidence",
      "tampa-bsm-evidence",
      "comma-localization-evidence",
      "comma-control-alignment",
      "comma-timing-audit",
      "road-can-evidence",
      "nhtsa-safety-evidence",
      "cassi-deployment-evidence",
    ]);
  });

  it("omits demos where no defensible authentic dataset was selected", () => {
    expect(chapters.filter((chapter) => chapter.demos.length === 0).map((chapter) => chapter.id))
      .toEqual([1, 2, 5, 7, 10, 14]);
  });

  it("provides concise book-grounded coverage summaries without reproducing chapters", () => {
    for (const chapter of chapters) {
      const summaries = chapter.sections.flatMap((section) => section.summary ? [section.summary] : []);
      expect(summaries.length).toBeGreaterThanOrEqual(2);
      expect(summaries.length).toBeLessThanOrEqual(3);
      for (const summary of summaries) {
        expect(summary.length).toBeGreaterThanOrEqual(80);
        expect(summary.length).toBeLessThanOrEqual(260);
      }
    }
  });
});
