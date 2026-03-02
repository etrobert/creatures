import type { Position } from "@creatures/shared/state";

export const subPositions = (pos1: Position, pos2: Position): Position => ({
  x: pos1.x - pos2.x,
  y: pos1.y - pos2.y,
});

export const addPositions = (pos1: Position, pos2: Position): Position => ({
  x: pos1.x + pos2.x,
  y: pos1.y + pos2.y,
});

export const multiplyPosition = (pos: Position, n: number): Position => ({
  x: pos.x * n,
  y: pos.y * n,
});
