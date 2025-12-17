import type { State } from "./state.js";

export function update(state: State, deltaTime: number): State {
  console.log(deltaTime + " elapsed");
  const creatureWithUpdatedPosition = {
    ...state.creature1,
    position: {
      ...state.creature1.position,
      x: state.creature1.position.x + 1,
    },
  };
  return { ...state, creature1: creatureWithUpdatedPosition };
}
