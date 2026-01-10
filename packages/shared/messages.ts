// WebSocket message types and schemas

import z from "zod";
import { stateSchema, actionSchema } from "./state.js";

// Server -> Client messages
export const consoleMessageSchema = z.object({
  type: z.literal("console"),
  message: z.string(),
});

export const stateUpdateMessageSchema = z.object({
  type: z.literal("state update"),
  state: stateSchema,
});

export const serverMessageSchema = z.discriminatedUnion("type", [
  consoleMessageSchema,
  stateUpdateMessageSchema,
]);

export type ServerMessage = z.infer<typeof serverMessageSchema>;

// Client -> Server messages
export const playerInputMessageSchema = z.object({
  type: z.literal("player input"),
  actions: z.array(actionSchema),
});

export const clientMessageSchema = z.discriminatedUnion("type", [
  playerInputMessageSchema,
]);

export type ClientMessage = z.infer<typeof clientMessageSchema>;
