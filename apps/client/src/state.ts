import type { State } from "@creatures/shared/state";

export let state: State | undefined;

export const setState = (newState: State) => (state = newState);

export const resetState = () => (state = undefined);

export let tickStart = 0;

export const setTickStart = (newTickStart: number) =>
  (tickStart = newTickStart);
