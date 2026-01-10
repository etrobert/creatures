import { serverMessageSchema } from "@creatures/shared/messages";
import { render } from "./render.js";
import { update } from "./update.js";
import { setupEventListeners } from "./input.js";
import { setState, state } from "./state.js";

export const activePlayer = 0;

// WebSocket test
const ws = new WebSocket("ws://localhost:3000");

ws.onopen = () => {
  console.log("Connected to WebSocket server");
};

ws.onmessage = (event) => {
  const data = serverMessageSchema.parse(JSON.parse(event.data));
  console.log("Message from server:", data);
};

ws.onerror = (error) => {
  console.error("WebSocket error:", error);
};

ws.onclose = () => {
  console.log("Disconnected from WebSocket server");
};

setupEventListeners();

function gameLoop(currentTime: number) {
  setState(update(state, currentTime));
  render(state, currentTime);
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
