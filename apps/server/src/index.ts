import type {
  PlayerInputMessage,
  ServerMessage,
} from "@creatures/shared/messages";
import { clientMessageSchema } from "@creatures/shared/messages";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import { createState } from "./state.js";
import { update } from "./update.js";
import { tickDuration } from "@creatures/shared/state";

const port = 3000;
const server = createServer();
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (data) => {
    const message = clientMessageSchema.parse(JSON.parse(data.toString()));

    switch (message.type) {
      case "player input":
        processPlayerInputMessage(message);
        break;
    }
  });

  ws.on("close", () => console.log("Client disconnected"));
});

function processPlayerInputMessage(message: PlayerInputMessage) {
  state = {
    ...state,
    entities: state.entities.map((entity) =>
      entity.id === message.creatureId
        ? {
            ...entity,
            nextActions: [...entity.nextActions, ...message.actions],
          }
        : entity,
    ),
  };
  broadcastState();
}

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
  console.log(state.entities);

  broadcastState();
}

setInterval(gameLoop, tickDuration);

server.listen(port, () =>
  console.log(`WebSocket server is running on ws://localhost:${port}`),
);
