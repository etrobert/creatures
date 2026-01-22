// WebSocket message types and schemas

import z from "zod";
import { stateSchema, actionSchema } from "./state.js";

export const stateUpdateMessageSchema = z.object({
  type: z.literal("state update"),
  state: stateSchema,
});

const assignPlayerIdMessageSchema = z.object({
  type: z.literal("assign player id"),
  id: z.string(),
});

export const serverMessageSchema = z.discriminatedUnion("type", [
  stateUpdateMessageSchema,
  assignPlayerIdMessageSchema,
]);

export type ServerMessage = z.infer<typeof serverMessageSchema>;

// Client -> Server messages
export const playerInputMessageSchema = z.object({
  type: z.literal("player input"),
  creatureId: z.string(),
  actions: z.array(actionSchema),
});

const resetActionsMessageSchema = z.object({
  type: z.literal("reset actions"),
  creatureId: z.string(),
});

export type PlayerInputMessage = z.infer<typeof playerInputMessageSchema>;
export type ResetActionsMessage = z.infer<typeof resetActionsMessageSchema>;

export const clientMessageSchema = z.discriminatedUnion("type", [
  playerInputMessageSchema,
  resetActionsMessageSchema,
]);

export type ClientMessage = z.infer<typeof clientMessageSchema>;
