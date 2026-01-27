import type { State } from "@creatures/shared/state";
import { removeGameEventListeners, setupDeathEventListeners } from "./input.js";

export const lossDetection = (state: State, playerId: string) => {
  return state.entities
    .filter((entity) => entity.type === "creature")
    .every((thisEntity) => thisEntity.player !== playerId);
};

export const lossKeyHandler = () => {
  removeGameEventListeners();
  setupDeathEventListeners();
};
