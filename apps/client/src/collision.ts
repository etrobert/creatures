import { countColumns, countRow, type Position } from "./state.js";

export const collisionWithMap = (positon: Position) =>
  outerMapCollision(positon);

const outerMapCollision = (positon: Position) =>
  positon.x < 0 ||
  positon.x >= countColumns ||
  positon.y < 0 ||
  positon.y >= countRow;
