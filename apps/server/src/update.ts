import { isCreature, type State } from "@creatures/shared/state";
import { updateEntity, updateProjectile } from "./updateCreature.js";

export function update(state: State): State {
  for (let entity of state.entities) state = updateEntity(state, entity);

  for (let projectile of state.projectiles)
    state = updateProjectile(state, projectile);
  return state;
}
