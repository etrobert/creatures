import type { State } from "@creatures/shared/state";
import { updateCreature } from "./updateCreature.js";

export const tickDuration = 300;

export function update(state: State, currentTime: number): State {
  if (currentTime - state.lastTick < tickDuration) return state;

  const lastTick = currentTime;

  for (let creature of state.creatures) state = updateCreature(state, creature);

  return { ...state, lastTick };
}
