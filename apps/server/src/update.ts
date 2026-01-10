import type { State } from "@creatures/shared/state";
import { updateCreature } from "./updateCreature.js";

export function update(state: State): State {
  for (let creature of state.creatures) state = updateCreature(state, creature);
  return state;
}
