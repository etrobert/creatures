import { render } from "./render.js";
import { setupEventListeners } from "./input.js";
import { state } from "./state.js";

function gameLoop(currentTime: number) {
  if (state === undefined) return;
  render(state, currentTime);
  requestAnimationFrame(gameLoop);
}

export function start() {
  setupEventListeners();
  requestAnimationFrame(gameLoop);
}
