import { type State, type Position, countColumns, countRow } from "./state.js";

import { updateCreature, updateProjectile } from "./updateCreature.js";

export const tickDuration = 300;

export function update(state: State, currentTime: number): State {
  if (currentTime - state.lastTick < tickDuration) return state;

  const lastTick = currentTime;

  state = state.creatures.reduce(
    (state, creature) => updateCreature(state, creature),
    state,
  );

  state = state.projectiles.reduce(
    (state, projectile) => updateProjectile(state, projectile),
    state,
  );

  return { ...state, lastTick };
}
