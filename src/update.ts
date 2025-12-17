import type { State } from "./state.js";

export function update(state: State, deltaTime: number): State {
  console.log(deltaTime + " elapsed");
  const newPosition = { ...state.position, x: state.position.x + 1 };
  return { position: newPosition };
}
