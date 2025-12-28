import { render } from "./render.js";
import { update } from "./update.js";
import { setupEventListeners } from "./input.js";
import { setState, state } from "./state.js";

export const activePlayer = 0;
export const activePlayerCreaturesID = state.creatures
  .filter((creature) => creature.player === activePlayer)
  .map((creature) => creature.id);
// export const activeCreatureID = activePlayerCreaturesID[0];

const getActiveCreatureID = () => {
  const activeCreatureID = activePlayerCreaturesID[0];
  if (activeCreatureID === undefined) throw new Error("Could not get canvas");
  return activeCreatureID;
};

export const activeCreatureID = getActiveCreatureID();

setupEventListeners();

function gameLoop(currentTime: number) {
  setState(update(state, currentTime));
  render(state, currentTime);
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
