import {
  countColumns,
  countRow,
  type Action,
  type Background,
  type Creature,
  type Direction,
  type Entity,
  type MoveAction,
  type Position,
} from "@creatures/shared/state";

// Game logic utilities

export const getNewPosition = (
  { x, y }: Position,
  direction: Direction,
): Position => {
  switch (direction) {
    case "up":
      return { x, y: y - 1 };
    case "down":
      return { x, y: y + 1 };
    case "right":
      return { x: x + 1, y };
    case "left":
      return { x: x - 1, y };
  }
};

export const collisionWithMap = (background: Background, position: Position) =>
  outerMapCollision(position) || backgroundMapCollision(background, position);

export const outerMapCollision = (positon: Position) =>
  positon.x < 0 ||
  positon.x >= countColumns ||
  positon.y < 0 ||
  positon.y >= countRow;

export const updatePosition = <T extends Entity>(
  entity: T,
  nextAction: MoveAction,
  collision: (newPosition: Position) => boolean,
): T => {
  const newPosition = getNewPosition(entity.position, nextAction.direction);

  if (collision(newPosition)) return entity;

  return {
    ...entity,
    position: newPosition,
    direction: nextAction.direction,
  };
};

export const isCreature = (entity: Entity): entity is Creature =>
  entity.type === "creature";

export const backgroundMapCollision = (
  background: Background,
  position: Position,
) => getTile(background, position) === "void";

export const getTile = (background: string[], position: Position) => {
  const tile = background[position.x + position.y * countColumns];
  if (tile === undefined) throw new Error("incorrect position");
  return tile;
};
