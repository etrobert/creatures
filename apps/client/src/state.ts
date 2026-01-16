import type { State } from "@creatures/shared/state";

export let state: State | undefined;

export const setState = (newState: State) => (state = newState);
