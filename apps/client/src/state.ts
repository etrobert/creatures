import type { State } from "@creatures/shared/state";

export let state: State = { lastTick: 0, entities: [], projectiles: [] };

export const setState = (newState: State) => (state = newState);
