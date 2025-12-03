import type { State } from "./state.js";

export function update(state: State, deltaTime: number) {
  console.log(deltaTime + " elapsed");
  const newPosition = { x: state.position.x + 1, y: state.position.y };
  return { position: newPosition };
}
