export type Creature = {
  id: string;
  player: number;
  health: number;
  maxHealth: number;
  position: Position;
  ongoingAction: Action | null;
  nextActions: Action[];
  direction: Direction;
};

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

export const createState = () => ({
  lastTick: 0,
  creatures: [
    createCreature(),
    createCreature({ player: 1, position: { x: 1, y: 1 } }),
    createCreature({ player: 0, position: { x: 5, y: 5 } }),
  ],
});

export let state = createState();

export const setState = (newState: State) => (state = newState);

export type State = ReturnType<typeof createState>;

export type Direction = "up" | "right" | "left" | "down";

export type MoveAction = {
  type: "move";
  direction: Direction;
};

export type AttackAction = {
  type: "attack";
  direction: Direction;
};

export type Action = MoveAction | AttackAction;

export type Position = { x: number; y: number };

export const countColumns = 10;
export const countRow = 7;
