import { serverMessageSchema } from "@creatures/shared/messages";
import { render } from "./render.js";
import { setupEventListeners } from "./input.js";
import { setState, state } from "./state.js";

export const activePlayer = 0;

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

setupEventListeners();

function gameLoop(currentTime: number) {
  render(state, currentTime);
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
