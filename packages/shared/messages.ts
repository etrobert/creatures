// WebSocket message types and schemas

import z from "zod";

// Server -> Client messages
export const consoleMessageSchema = z.object({
  type: z.literal("console"),
  message: z.string(),
});

export const serverMessageSchema = z.discriminatedUnion("type", [
  consoleMessageSchema,
]);

export type ServerMessage = z.infer<typeof serverMessageSchema>;
