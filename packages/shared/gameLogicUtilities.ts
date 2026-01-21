import {
  countColumns,
  countRow,
  type GameMap,
  type Creature,
  type Direction,
  type Entity,
  type MoveAction,
  type Position,
  type State,
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

export const collisionWithMap = (map: GameMap, position: Position) =>
  outerMapCollision(position) || mapCollision(map, position);

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

export const mapCollision = (map: GameMap, position: Position) =>
  getTile(map, position) === "void";

export const getTile = (map: GameMap, position: Position) => {
  const tile = map[position.x + position.y * countColumns];
  if (tile === undefined) throw new Error("incorrect position");
  return tile;
};

export const findActiveCreature = (
  state: State,
  activeCreatureId: string,
): Creature => {
  const activeCreature = state.entities.find(
    ({ id }) => id === activeCreatureId,
  );
  if (activeCreature === undefined)
    throw new Error("Couldn't find active creature");
  if (activeCreature.type !== "creature")
    throw new Error("Active creature is not a creature");
  return activeCreature;
};

export const getEntity = (state: State, entityId: string): Entity => {
  const entity = state.entities.find(({ id }) => id === entityId);
  if (entity === undefined) throw new Error("entity not found");
  return entity;
};

export const getCreatureAtPosition = (
  state: State,
  position: Position,
): Creature | undefined =>
  state.entities
    .filter(isCreature)
    .find(
      (creature) =>
        creature.position.x === position.x &&
        creature.position.y === position.y,
    );
