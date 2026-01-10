import { render } from "./render.js";
import { update } from "./update.js";
import { setupEventListeners } from "./input.js";
import { setState, state } from "./state.js";

export const activePlayer = 0;
export const activePlayerCreaturesId = state.creatures
  .filter((creature) => creature.player === activePlayer)
  .map((creature) => creature.id);

const getInitialActiveCreatureId = () => {
  const activeCreatureId = activePlayerCreaturesId[0];
  if (activeCreatureId === undefined) throw new Error("Could not get canvas");
  return activeCreatureId;
};
export let activeCreatureId = getInitialActiveCreatureId();

export const setActiveCreatureId = (newActiveCreatureId: string) =>
  (activeCreatureId = newActiveCreatureId);

setupEventListeners();

function gameLoop(currentTime: number) {
  setState(update(state, currentTime));
  render(state, currentTime);
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
