import { render } from "./render.js";
import { setupEventListeners } from "./input.js";
import { state } from "./state.js";

export const activePlayer = 0;

setupEventListeners();

function gameLoop(currentTime: number) {
  render(state, currentTime);
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
