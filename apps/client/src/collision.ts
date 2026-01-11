import { countColumns, countRow, type Position } from "./state.js";

export const collisionWithMap = (newPosition: Position) =>
  newPosition.x < 0 ||
  newPosition.x >= countColumns ||
  newPosition.y < 0 ||
  newPosition.y >= countRow;
