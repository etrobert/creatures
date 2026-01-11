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

export const actionSchema = z.discriminatedUnion("type", [
  moveActionSchema,
  attackActionSchema,
  fireballActionSchema,
]);

export const creatureSchema = z.object({
  id: z.string(),
  player: z.number(),
  health: z.number(),
  maxHealth: z.number(),
  position: positionSchema,
  ongoingAction: actionSchema.nullable(),
  nextActions: z.array(actionSchema),
  direction: directionSchema,
});

export const projectileSchema = z.object({
  id: z.string(),
  position: positionSchema,
  direction: directionSchema,
});

export const stateSchema = z.object({
  lastTick: z.number(),
  creatures: z.array(creatureSchema),
  projectiles: z.array(projectileSchema),
});

export type Position = z.infer<typeof positionSchema>;
export type Direction = z.infer<typeof directionSchema>;
export type MoveAction = z.infer<typeof moveActionSchema>;
export type AttackAction = z.infer<typeof attackActionSchema>;
export type FireballAction = z.infer<typeof fireballActionSchema>;
export type Action = z.infer<typeof actionSchema>;
export type Creature = z.infer<typeof creatureSchema>;
export type Projectile = z.infer<typeof projectileSchema>;
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

export const updatePosition = (
  creature: Creature,
  nextAction: MoveAction,
  collision: (newPosition: Position) => boolean,
): Creature => {
  const newPosition = getNewPosition(creature.position, nextAction.direction);

  if (collision(newPosition)) return creature;

  return {
    ...creature,
    position: newPosition,
    direction: nextAction.direction,
  };
};
