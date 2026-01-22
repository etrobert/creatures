import {
  serverMessageSchema,
  type ClientMessage,
} from "@creatures/shared/messages";
import { setState, state } from "./state.js";
import { start } from "./index.js";
import { setActivePlayer } from "./activePlayerCreature.js";

// WebSocket connection
// In development: ws://localhost:3000
// In production: use the same host as the page (wss:// for https, ws:// for http)
const getWebSocketUrl = () => {
  // In development, Vite serves the app separately from the backend
  if (import.meta.env.DEV) return "ws://localhost:3000";

  // In production, the backend serves the static files
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;
  return `${protocol}//${host}`;
};

export const ws = new WebSocket(getWebSocketUrl());

ws.onopen = () => console.log("Connected to WebSocket server");

ws.onmessage = (event) => {
  const data = serverMessageSchema.parse(JSON.parse(event.data));
  switch (data.type) {
    case "state update":
      if (state === undefined) start();
      setState(data.state);
      break;
    case "assign id":
      setActivePlayer(data.id);
      break;
  }
};

ws.onerror = (error) => console.error("WebSocket error:", error);

ws.onclose = () => {
  console.log("Disconnected from WebSocket server");
  stop();
};

export const sendClientMessage = (message: ClientMessage) =>
  ws.send(JSON.stringify(message));
