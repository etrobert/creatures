import { j } from "@creatures/shared/test";
import type { ServerMessage } from "@creatures/shared/messages";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import { createState } from "./state.js";

console.log(" This is coming from shared: " + j);

const port = 3000;
const server = createServer();
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("Client connected");

  const sendMessage = (message: ServerMessage) =>
    ws.send(JSON.stringify(message));

  sendMessage({ type: "console", message: "Hello from server!" });

  sendMessage({ type: "state update", state: { lastTick: 0, creatures: [] } });

  ws.on("message", (data) => {
    console.log("Received:", data.toString());
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

let state = createState();

function gameLoop() {
  console.log("game loop run");
  for (const client of wss.clients)
    client.send(
      JSON.stringify({
        type: "state update",
        state,
      } satisfies ServerMessage),
    );
}

setInterval(gameLoop, 300);

server.listen(port, () => {
  console.log(`WebSocket server is running on ws://localhost:${port}`);
});
