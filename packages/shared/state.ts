// Game state types and constants

import { z } from "zod";

export const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const directionSchema = z.enum(["up", "right", "left", "down"]);

export const moveActionSchema = z.object({
  type: z.literal("move"),
  direction: directionSchema,
});

export const attackActionSchema = z.object({
  type: z.literal("attack"),
  direction: directionSchema,
});

export const fireballActionSchema = z.object({
  type: z.literal("fireball"),
});

const fireballMoveActionSchema = z.object({
  type: z.literal("fireball move"),
});

export const actionSchema = z.discriminatedUnion("type", [
  moveActionSchema,
  attackActionSchema,
  fireballActionSchema,
  fireballMoveActionSchema,
]);

const basicEntitySchema = z.object({
  id: z.string(),
  type: z.literal("entity"),
  position: positionSchema,
  ongoingAction: actionSchema.nullable(),
  nextActions: z.array(actionSchema),
  direction: directionSchema,
});

export const creatureSchema = basicEntitySchema.extend({
  type: z.literal("creature"),
  player: z.number(),
  health: z.number(),
  maxHealth: z.number(),
});

export const entitySchema = z.discriminatedUnion("type", [
  basicEntitySchema,
  creatureSchema,
]);

export const stateSchema = z.object({
  lastTick: z.number(),
  entities: z.array(entitySchema),
});

export type Position = z.infer<typeof positionSchema>;
export type Direction = z.infer<typeof directionSchema>;
export type MoveAction = z.infer<typeof moveActionSchema>;
export type AttackAction = z.infer<typeof attackActionSchema>;
export type Action = z.infer<typeof actionSchema>;
export type Entity = z.infer<typeof entitySchema>;
export type Creature = z.infer<typeof creatureSchema>;
export type State = z.infer<typeof stateSchema>;

export const countColumns = 10;
export const countRow = 7;

export const tickDuration = 300;

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

export const collisionWithMap = (newPosition: Position): boolean =>
  newPosition.x < 0 ||
  newPosition.x >= countColumns ||
  newPosition.y < 0 ||
  newPosition.y >= countRow;

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
