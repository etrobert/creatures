import { type State } from "@creatures/shared/state";
import { updateEntity } from "./updateEntity.js";

export function update(state: State): State {
  for (const entity of state.entities) {
    if (state.entities.some((thisEntity) => thisEntity.id === entity.id))
      state = updateEntity(state, entity.id);
  }
  return state;
}
