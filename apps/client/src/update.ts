import { type State, type Position, countColumns, countRow } from "./state.js";

import { updateCreature } from "./updateCreature.js";

export const tickDuration = 300;

export function update(state: State, currentTime: number): State {
  if (currentTime - state.lastTick < tickDuration) return state;

  const lastTick = currentTime;

  const creatures = state.creatures.map((creature) =>
    updateCreature(state, creature),
  );

  return { lastTick, creatures };
}
