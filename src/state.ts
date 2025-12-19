export type Creature = {
  player: number;
  health: number;
  position: Position;
  ongoingAction: Action | null;
  nextActions: Action[];
};

const createCreature = ({
  player = 0,
  position = { x: 0, y: 0 },
} = {}): Creature => ({
  player,
  health: 10,
  position,
  ongoingAction: null,
  nextActions: [],
});

export const createState = () => ({
  lastTick: 0,
  creatures: [
    createCreature(),
    createCreature({ player: 1, position: { x: 1, y: 1 } }),
  ],
});

export let state = createState();

export const setState = (newState: State) => (state = newState);

export type State = ReturnType<typeof createState>;

export type Direction = "up" | "right" | "left" | "down";

export type Action = {
  type: "move";
  direction: Direction;
};

export type Position = { x: number; y: number };

export const countColumns = 10;
export const countRow = 7;
