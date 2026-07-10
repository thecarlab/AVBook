import { describe, expect, it } from "vitest";
import {
  bsmWindow,
  countBy,
  evaluateCanDetector,
  filterNhtsa,
  nearestSample,
  pearsonAtOffset,
  timingVerdict,
} from "./realData";
import type { NhtsaRecord, RoadCaptureData } from "./realData";

describe("real-data lab calculations", () => {
  it("filters and groups incident records without inventing denominators", () => {
    const base = { roadway: "Street", state: "CA" } as NhtsaRecord;
    const rows = [
      { ...base, id: "a", crashWith: "Car" },
      { ...base, id: "b", crashWith: "Car" },
      { ...base, id: "c", state: "AZ", crashWith: "Truck" },
    ];
    const filtered = filterNhtsa(rows, { state: "CA", roadway: "All" });
    expect(filtered).toHaveLength(2);
    expect(countBy(filtered, (row) => row.crashWith)).toEqual([["Car", 2]]);
  });

  it("separates stale intervals from BSM counter discontinuities", () => {
    const rows = [
      { t: 0, msgCount: 1 },
      { t: 0.1, msgCount: 2 },
      { t: 0.8, msgCount: 7 },
    ] as never;
    const result = bsmWindow(rows, 0, 2, 0.5);
    expect(result.staleIntervals).toEqual([0.7000000000000001]);
    expect(result.counterGaps).toHaveLength(1);
  });

  it("uses nearest timestamp and computes lagged signal correlation", () => {
    const scalar: Array<[number, string]> = [[0, "a"], [1, "b"], [2, "c"]];
    expect(nearestSample(scalar, 1.6)[1]).toBe("c");
    const steering: Array<[number, number]> = [[0, 1], [1, 2], [2, 3]];
    const gyro: Array<[number, [number, number, number]]> = [
      [0, [0, 0, -1]], [1, [0, 0, -2]], [2, [0, 0, -3]],
    ];
    expect(pearsonAtOffset(steering, gyro, 0)).toBeCloseTo(-1);
  });

  it("classifies timing evidence from recorded rate and gaps", () => {
    expect(timingVerdict({ samples: 10, medianRateHz: 100, p95GapMs: 10, maxGapMs: 11 }, 20, 20)).toBe("oversampled");
    expect(timingVerdict({ samples: 10, medianRateHz: 5, p95GapMs: 210, maxGapMs: 260 }, 20, 100)).toBe("deadline-risk");
    expect(timingVerdict({ samples: 10, medianRateHz: 10, p95GapMs: 100, maxGapMs: 100 }, 20, 150)).toBe("sample-reuse");
  });

  it("shows why payload evidence survives a masquerade frequency attack", () => {
    const capture: RoadCaptureData = {
      id: "capture",
      modifiedMasquerade: true,
      description: "",
      durationSeconds: 2,
      attackInterval: [0.5, 1.5],
      targetId: "0xd0",
      targetPattern: "XXXXXXXXXXFFXXXX",
      windows: [
        [0, 100, 50, 0, 1, 20],
        [0.5, 100, 50, 50, 20, 50],
        [1, 100, 50, 50, 20, 50],
        [1.5, 100, 50, 0, 1, 20],
      ],
    };
    expect(evaluateCanDetector(capture, "frequency", 75, 1).recall).toBe(0);
    expect(evaluateCanDetector(capture, "payload", 75, 1).recall).toBe(1);
  });
});
