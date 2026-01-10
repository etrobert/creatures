import { serverMessageSchema } from "@creatures/shared/messages";
import { setState } from "./state.js";

// WebSocket connection
export const ws = new WebSocket("ws://localhost:3000");

ws.onopen = () => console.log("Connected to WebSocket server");

ws.onmessage = (event) => {
  const data = serverMessageSchema.parse(JSON.parse(event.data));
  switch (data.type) {
    case "console":
      console.log("From server: ", data.message);
      break;
    case "state update":
      setState(data.state);
      break;
  }
};

ws.onerror = (error) => console.error("WebSocket error:", error);

ws.onclose = () => console.log("Disconnected from WebSocket server");
