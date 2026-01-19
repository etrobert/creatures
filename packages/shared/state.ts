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
  type: z.literal("fireball:move"),
});

export const actionSchema = z.discriminatedUnion("type", [
  moveActionSchema,
  attackActionSchema,
  fireballActionSchema,
  fireballMoveActionSchema,
]);

export const creatureNameSchema = z.enum(["bulbizard", "salameche"]);
export type CreatureName = z.infer<typeof creatureNameSchema>;

const basicEntitySchema = z.object({
  id: z.string(),
  type: z.literal("entity"),
  position: positionSchema,
  ongoingAction: actionSchema.nullable(),
  nextActions: z.array(actionSchema),
  direction: directionSchema,
});

export const creatureSchema = basicEntitySchema.extend({
  name: creatureNameSchema,
  type: z.literal("creature"),
  player: z.number(),
  health: z.number(),
  maxHealth: z.number(),
});

export const entitySchema = z.discriminatedUnion("type", [
  basicEntitySchema,
  creatureSchema,
]);

const tileSchema = z.enum(["grass", "void"]);

export const mapSchema = z.array(tileSchema);

export const stateSchema = z.object({
  lastTick: z.number(),
  entities: z.array(entitySchema),
  map: mapSchema,
});

export type Position = z.infer<typeof positionSchema>;
export type Direction = z.infer<typeof directionSchema>;
export type MoveAction = z.infer<typeof moveActionSchema>;
export type AttackAction = z.infer<typeof attackActionSchema>;
export type FireballAction = z.infer<typeof fireballActionSchema>;
export type Action = z.infer<typeof actionSchema>;
export type Entity = z.infer<typeof entitySchema>;
export type Creature = z.infer<typeof creatureSchema>;
export type State = z.infer<typeof stateSchema>;
export type GameMap = z.infer<typeof mapSchema>;

export type ActionType = Action["type"];

export type CreatureKit = {
  name: CreatureName;
  actionQ: ActionType;
  actionW: ActionType;
  actionE: ActionType;
};

export const countColumns = 10;
export const countRow = 7;

export const tickDuration = 300;
