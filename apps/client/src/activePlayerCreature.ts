import { state } from "./state.js";

export const activePlayer = 0;

export const listPlayerCreaturesId = (player: number) => {
  return state.creatures
    .filter((creature) => creature.player === player)
    .map((creature) => creature.id);
};

const getInitialActiveCreatureId = () => {
  const activePlayerCreaturesId = listPlayerCreaturesId(activePlayer);
  const activeCreatureId = activePlayerCreaturesId[0];
  if (activeCreatureId === undefined)
    throw new Error("Could not get active creature");
  return activeCreatureId;
};
export let activeCreatureId = getInitialActiveCreatureId();

export const setActiveCreatureId = (newActiveCreatureId: string) =>
  (activeCreatureId = newActiveCreatureId);
