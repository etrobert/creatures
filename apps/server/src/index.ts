import { j } from "@creatures/shared/test";
import type { ServerMessage } from "@creatures/shared/messages";
import { clientMessageSchema } from "@creatures/shared/messages";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import { createState } from "./state.js";
import { update } from "./update.js";
import { tickDuration } from "@creatures/shared/state";

console.log(" This is coming from shared: " + j);

const port = 3000;
const server = createServer();
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("Client connected");

  // TODO: Assign player IDs dynamically
  const playerId = 0;

  const sendMessage = (message: ServerMessage) =>
    ws.send(JSON.stringify(message));

  sendMessage({ type: "console", message: "Hello from server!" });

  ws.on("message", (data) => {
    const message = clientMessageSchema.parse(JSON.parse(data.toString()));

    switch (message.type) {
      case "player input":
        state = {
          ...state,
          creatures: state.creatures.map((creature) =>
            creature.player === playerId
              ? {
                  ...creature,
                  nextActions: [...creature.nextActions, ...message.actions],
                }
              : creature,
          ),
        };
        broadcastState();
        break;
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

let state = createState();

function broadcastState() {
  for (const client of wss.clients)
    client.send(
      JSON.stringify({
        type: "state update",
        state,
      } satisfies ServerMessage),
    );
}

function gameLoop() {
  state = update(state);

  broadcastState();
}

setInterval(gameLoop, tickDuration);

server.listen(port, () => {
  console.log(`WebSocket server is running on ws://localhost:${port}`);
});
