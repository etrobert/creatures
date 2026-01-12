import { isCreature, type State } from "@creatures/shared/state";
import { updateCreature, updateProjectile } from "./updateCreature.js";

export function update(state: State): State {
  // TODO: updateCreature -> updateEntity
  for (let entity of state.entities) {
    if (isCreature(entity)) state = updateCreature(state, entity);
  }
  for (let projectile of state.projectiles)
    state = updateProjectile(state, projectile);
  return state;
}
