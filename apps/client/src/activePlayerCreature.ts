import { isCreature } from "@creatures/shared/state";
import { state } from "./state.js";

export const activePlayer = 0;

export const listPlayerCreatureIds = (player: number) => {
  return state.entities
    .filter(isCreature)
    .filter((creature) => creature.player === player)
    .map((creature) => creature.id);
};

export let activeCreatureId = "0";

export const setActiveCreatureId = (newActiveCreatureId: string) =>
  (activeCreatureId = newActiveCreatureId);
