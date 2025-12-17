export type Creature = {
  player: number;
  health: number;
  position: { x: number; y: number };
  nextAction: Action | null;
};

const createCreature = ({
  player = 0,
  position = { x: 0, y: 0 },
} = {}): Creature => ({
  player,
  health: 10,
  position,
  nextAction: null,
});

export const createState = () => ({
  creatures: [
    createCreature(),
    createCreature({ player: 1, position: { x: 1, y: 1 } }),
  ],
});

export let state = createState();

export const setState = (newState: State) => (state = newState);

export type State = ReturnType<typeof createState>;

type Action = {
  type: "move";
  direction: "up" | "right" | "left" | "down";
};
