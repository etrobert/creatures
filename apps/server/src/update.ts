import type { State } from "@creatures/shared/state";
import { updateCreature, updateProjectile } from "./updateCreature.js";

export function update(state: State): State {
  for (let creature of state.creatures) state = updateCreature(state, creature);
  for (let projectile of state.projectiles)
    state = updateProjectile(state, projectile);
  return state;
}
