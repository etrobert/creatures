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

export let activeCreatureId = "0";

export const setActiveCreatureId = (newActiveCreatureId: string) =>
  (activeCreatureId = newActiveCreatureId);
