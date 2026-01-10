import { activePlayer } from "./index.js";
import { state } from "./state.js";

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
