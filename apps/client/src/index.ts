import { render } from "./render.js";
import { removeGameEventListeners, setupGameEventListeners } from "./input.js";
import { resetState, state } from "./state.js";

function gameLoop(currentTime: number) {
  if (state === undefined) return;
  render(state, currentTime);
  requestAnimationFrame(gameLoop);
}

export function start() {
  setupGameEventListeners();
  requestAnimationFrame(gameLoop);
}

export function stop() {
  resetState();
  removeGameEventListeners();
}
