import type { State } from "./state.js";

export function update(state: State, deltaTime: number): State {
  console.log(deltaTime + " elapsed");

  const updatedCreatures = state.creatures.map((creature) => ({
    ...creature,
    position: {
      ...creature.position,
      x: creature.position.x + 1,
    },
  }));

  return { ...state, creatures: updatedCreatures };
}
