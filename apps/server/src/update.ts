import { type State } from "@creatures/shared/state";
import { updateEntity } from "./updateEntity.js";

export function update(state: State): State {
  for (let entity of state.entities) state = updateEntity(state, entity.id);

  return state;
}
