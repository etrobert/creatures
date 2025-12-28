import { render } from "./render.js";
import { update } from "./update.js";
import { setupEventListeners } from "./input.js";
import { setState, state } from "./state.js";

export const activePlayer = 0;
export const activePlayerCreatures = state.creatures.filter(
  (creature) => creature.player === activePlayer,
);

setupEventListeners();

function gameLoop(currentTime: number) {
  setState(update(state, currentTime));
  render(state, currentTime);
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
