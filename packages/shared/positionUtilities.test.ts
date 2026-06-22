import { describe, expect, test } from "vitest";
import {
  addPositions,
  multiplyPosition,
  subPositions,
} from "@creatures/shared/positionUtilities";
import type { Position } from "@creatures/shared/state";

describe("subPositions", () => {
  test("subtracts component-wise", () => {
    const a: Position = { x: 5, y: 3 };
    const b: Position = { x: 2, y: 8 };
    expect(subPositions(a, b)).toEqual({ x: 3, y: -5 });
  });

  test("subtracting a position from itself yields the origin", () => {
    const a: Position = { x: 4, y: 9 };
    expect(subPositions(a, a)).toEqual({ x: 0, y: 0 });
  });

  test("does not mutate its arguments", () => {
    const a: Position = { x: 5, y: 3 };
    const b: Position = { x: 2, y: 8 };
    subPositions(a, b);
    expect(a).toEqual({ x: 5, y: 3 });
    expect(b).toEqual({ x: 2, y: 8 });
  });
});

describe("addPositions", () => {
  test("adds component-wise", () => {
    const a: Position = { x: 5, y: 3 };
    const b: Position = { x: 2, y: 8 };
    expect(addPositions(a, b)).toEqual({ x: 7, y: 11 });
  });

  test("handles negative components", () => {
    expect(addPositions({ x: -1, y: -2 }, { x: 1, y: 2 })).toEqual({
      x: 0,
      y: 0,
    });
  });

  test("does not mutate its arguments", () => {
    const a: Position = { x: 5, y: 3 };
    const b: Position = { x: 2, y: 8 };
    addPositions(a, b);
    expect(a).toEqual({ x: 5, y: 3 });
    expect(b).toEqual({ x: 2, y: 8 });
  });
});

describe("multiplyPosition", () => {
  test("scales both components", () => {
    expect(multiplyPosition({ x: 3, y: -4 }, 2)).toEqual({ x: 6, y: -8 });
  });

  test("multiplying by zero yields the origin", () => {
    expect(multiplyPosition({ x: 3, y: 4 }, 0)).toEqual({ x: 0, y: 0 });
  });

  test("multiplying by a negative number flips signs", () => {
    expect(multiplyPosition({ x: 3, y: -4 }, -1)).toEqual({ x: -3, y: 4 });
  });

  test("does not mutate its argument", () => {
    const pos: Position = { x: 3, y: -4 };
    multiplyPosition(pos, 2);
    expect(pos).toEqual({ x: 3, y: -4 });
  });
});
