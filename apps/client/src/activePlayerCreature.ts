import { isCreature } from "@creatures/shared/gameLogicUtilities";
import { state } from "./state.js";
import type { State } from "@creatures/shared/state";

export let activePlayer = "0";

export const setActivePlayer = (newActivePlayer: string) =>
  (activePlayer = newActivePlayer);

export const listPlayerCreatureIds = (state: State, player: string) =>
  state.entities
    .filter(isCreature)
    .filter((creature) => creature.player === player)
    .map((creature) => creature.id);

export const initActiveCreatureId = () => {
  if (state === undefined) throw new Error("state is undefined");
  const newActiveCreatureId = listPlayerCreatureIds(state, activePlayer)[0];
  activeCreatureId = newActiveCreatureId;
};

export const nextActiveCreature = () => {
  if (state === undefined) throw new Error("state is undefined");
  if (activeCreatureId === undefined) return; // we're dead
  const creatureIds = listPlayerCreatureIds(state, activePlayer);
  const currentIndex = creatureIds.indexOf(activeCreatureId);
  const newIndex = (currentIndex + 1) % creatureIds.length;
  const newActiveCreatureId = creatureIds[newIndex];
  if (newActiveCreatureId === undefined)
    throw new Error("newActiveCreatureId is undefined");
  activeCreatureId = newActiveCreatureId;
};

export let activeCreatureId: string | undefined = "0";

export const setActiveCreatureId = (newActiveCreatureId: string) =>
  (activeCreatureId = newActiveCreatureId);

export const updateActiveCreatureId = () => {
  if (state === undefined) throw new Error("state is undefined");
  if (state.entities.some((thisEntity) => thisEntity.id === activeCreatureId))
    return;
  initActiveCreatureId();
};
