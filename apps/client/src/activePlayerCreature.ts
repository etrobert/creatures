import { isCreature } from "@creatures/shared/gameLogicUtilities";
import { state } from "./state.js";

export let activePlayer = "0";

export const setActivePlayer = (newActivePlayer: string) =>
  (activePlayer = newActivePlayer);

export const listPlayerCreatureIds = (player: string) => {
  if (state === undefined) throw new Error("state is undefined");
  return state.entities
    .filter(isCreature)
    .filter((creature) => creature.player === player)
    .map((creature) => creature.id);
};

export const initActiveCreatureId = () => {
  const newActiveCreatureId = listPlayerCreatureIds(activePlayer)[0];
  if (newActiveCreatureId === undefined)
    throw new Error("no creatures for active player");
  activeCreatureId = newActiveCreatureId;
};

export const nextActiveCreature = () => {
  const creatureIds = listPlayerCreatureIds(activePlayer);
  const currentIndex = creatureIds.indexOf(activeCreatureId);
  const newIndex = (currentIndex + 1) % creatureIds.length;
  const newActiveCreatureId = creatureIds[newIndex];
  if (newActiveCreatureId === undefined)
    throw new Error("newActiveCreatureId is undefined");
  activeCreatureId = newActiveCreatureId;
};

export let activeCreatureId = "0";

export const setActiveCreatureId = (newActiveCreatureId: string) =>
  (activeCreatureId = newActiveCreatureId);
