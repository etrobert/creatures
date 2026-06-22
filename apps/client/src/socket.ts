import {
  serverMessageSchema,
  type ClientMessage,
} from "@creatures/shared/messages";
import { setState, setTickStart, state } from "./state.js";
import { start } from "./index.js";
import {
  initActiveCreatureId,
  setActivePlayer,
  updateActiveCreatureId,
} from "./activePlayerCreature.js";

// WebSocket connection: always same-origin at /ws.
// In production the backend serves the static files and handles /ws directly.
// In development Vite proxies /ws to the backend (see vite.config.ts), so the
// client doesn't need to know the backend's port.
const getWebSocketUrl = () => {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws`;
};

export const ws = new WebSocket(getWebSocketUrl());

ws.onopen = () => console.log("Connected to WebSocket server");

ws.onmessage = (event) => {
  const data = serverMessageSchema.parse(JSON.parse(event.data));
  switch (data.type) {
    case "state update":
      if (state === undefined) start();
      if (state?.tick !== data.state.tick) {
        if (typeof document.timeline.currentTime !== "number")
          throw new Error("Incorrect currentTime");
        setTickStart(document.timeline.currentTime);
      }
      setState(data.state);
      updateActiveCreatureId();
      break;
    case "assign player id":
      setActivePlayer(data.id);
      initActiveCreatureId();
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
