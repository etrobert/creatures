// WebSocket message types and schemas

import z from "zod";
import { stateSchema, actionSchema } from "./state.js";

export const stateUpdateMessageSchema = z.object({
  type: z.literal("state update"),
  state: stateSchema,
});

export const serverMessageSchema = z.discriminatedUnion("type", [
  stateUpdateMessageSchema,
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
