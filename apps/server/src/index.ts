import type {
  PlayerInputMessage,
  ResetActionsMessage,
  ServerMessage,
} from "@creatures/shared/messages";
import { clientMessageSchema } from "@creatures/shared/messages";
import WebSocket, { WebSocketServer } from "ws";
import { createServer } from "http";
import { createState } from "./state.js";
import { update } from "./update.js";
import { tickDuration } from "@creatures/shared/state";
import express from "express";
import path from "path";
import { updateEntityById } from "./actionUtilities.js";

const port = process.env.PORT || 3000;
const app = express();

// Serve static files from the client build (production only)
const clientDistPath = process.env.CLIENT_DIST_PATH;
if (clientDistPath !== undefined) {
  app.use(express.static(clientDistPath));
  app.use((req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

const server = createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Map<WebSocket, { id: string | undefined }>();

const ids = ["0", "1"];

const getNextId = (): string | undefined => {
  return ids.find((id) =>
    clients.entries().every(([, client]) => client.id !== id),
  );
};

const sendMessage = (ws: WebSocket, message: ServerMessage) =>
  ws.send(JSON.stringify(message));

wss.on("connection", (ws) => {
  const id = getNextId();

  console.log("Client connected: ", id ?? "spectator");

  clients.set(ws, { id });

  sendMessage(ws, { type: "state update", state });
  if (id !== undefined) {
    sendMessage(ws, { type: "assign player id", id });
  } else {
    sendMessage(ws, { type: "assign spectator" });
  }

  ws.on("message", (data) => {
    const message = clientMessageSchema.parse(JSON.parse(data.toString()));

    switch (message.type) {
      case "player input":
        processPlayerInputMessage(message);
        break;
      case "reset state":
        processResetStateMessage();
        break;
      case "reset actions":
        processResetActions(message);
        break;
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected: ", id ?? "spectator");
    clients.delete(ws);
  });
});

function processResetActions(message: ResetActionsMessage) {
  state = updateEntityById(state, message.creatureId, (entity) => ({
    ...entity,
    nextActions: [],
  }));
  broadcastState();
}

function processPlayerInputMessage(message: PlayerInputMessage) {
  state = updateEntityById(state, message.creatureId, (entity) => ({
    ...entity,
    nextActions: [...entity.nextActions, ...message.actions],
  }));

  broadcastState();
}

function processResetStateMessage() {
  state = createState();

  broadcastState();

  for (const ws of wss.clients) {
    const client = clients.get(ws);
    if (client === undefined) throw new Error("Websocket not registered");
    if (client.id !== undefined) {
      sendMessage(ws, { type: "assign player id", id: client.id });
    } else {
      sendMessage(ws, { type: "assign spectator" });
    }
  }
}

let state = createState();

function broadcastState() {
  for (const client of wss.clients)
    sendMessage(client, { type: "state update", state });
}

function gameLoop() {
  state = update(state);

  broadcastState();
}

setInterval(gameLoop, tickDuration);

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`WebSocket server is running on ws://localhost:${port}`);
});
