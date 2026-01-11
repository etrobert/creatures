import type { State } from "@creatures/shared/state";

export let state: State | undefined;
// = { lastTick: 0, creatures: [], background: [] };
// export let state: State = { lastTick: 0, creatures: [], background: [] };

export const setState = (newState: State) => (state = newState);
