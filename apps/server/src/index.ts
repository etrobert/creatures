import { j } from "@creatures/shared/test";
import type { ServerMessage } from "@creatures/shared/messages";
import express from "express";
import { WebSocketServer } from "ws";
import { createServer } from "http";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

console.log(" This is coming from shared: " + j);

const port = 3000;
const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.send(
    JSON.stringify({
      type: "console",
      message: "Hello from server!",
    } satisfies ServerMessage),
  );

  ws.on("message", (data) => {
    console.log("Received:", data.toString());
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

server.listen(port, () => {
  console.log(`Express app listening on port ${port}`);
  console.log(`WebSocket server is running on ws://localhost:${port}`);
});
