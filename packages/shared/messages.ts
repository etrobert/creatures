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

export type PlayerInputMessage = z.infer<typeof playerInputMessageSchema>;

export const clientMessageSchema = z.discriminatedUnion("type", [
  playerInputMessageSchema,
]);

export type ClientMessage = z.infer<typeof clientMessageSchema>;
