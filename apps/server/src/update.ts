import { isCreature, type State } from "@creatures/shared/state";
import { updateEntity } from "./updateCreature.js";

export function update(state: State): State {
  for (let entity of state.entities) state = updateEntity(state, entity);

  return state;
}
