import { render } from "./render.js";
import { update } from "./update.js";
import { setupEventListeners } from "./input.js";
import { setState, state } from "./state.js";

let lastTime = 0;

setupEventListeners();

function gameLoop(currentTime: number) {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  setState(update(state, deltaTime));
  render(state);
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
