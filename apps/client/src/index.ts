import { render } from "./render.js";
import { setupEventListeners } from "./input.js";
import { state } from "./state.js";

setupEventListeners();

function gameLoop(currentTime: number) {
  render(state, currentTime);
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
