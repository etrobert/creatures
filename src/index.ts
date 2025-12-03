import { render } from "./render.js";
import { update } from "./update.js";

let lastTime = 0;

function gameLoop(currentTime: number) {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  update(deltaTime);
  render();
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
