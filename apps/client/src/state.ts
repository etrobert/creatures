import type { Creature, State, Position } from "@creatures/shared/state";

export { countColumns, countRow } from "@creatures/shared/state";
export type { Creature, State, Direction, Action, Position } from "@creatures/shared/state";

let nextId = 0;

const createCreature = ({
  player = 0,
  position = { x: 3, y: 2 },
} = {}): Creature => ({
  id: String(nextId++),
  player,
  health: 9,
  maxHealth: 10,
  position,
  direction: "down",
  ongoingAction: null,
  nextActions: [],
});

export const createState = (): State => ({
  lastTick: 0,
  creatures: [
    createCreature(),
    createCreature({ player: 1, position: { x: 1, y: 1 } }),
  ],
});

export let state = createState();

export const setState = (newState: State) => (state = newState);
