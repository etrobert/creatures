import { backgroundMap, getTile } from "./background.js";
import { countColumns, countRow, type Position } from "./state.js";

export const collisionWithMap = (position: Position) =>
  outerMapCollision(position) ? true : backgroundMapCollision(position);

const outerMapCollision = (position: Position) =>
  position.x < 0 ||
  position.x >= countColumns ||
  position.y < 0 ||
  position.y >= countRow;

const backgroundMapCollision = (position: Position) =>
  getTile(backgroundMap, position) === "void";
