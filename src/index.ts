import { render } from "./render.js";
import { createState } from "./state.js";
import { update } from "./update.js";

let lastTime = 0;
let state = createState();

function gameLoop(currentTime: number) {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  state = update(state, deltaTime);
  render(state);
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
