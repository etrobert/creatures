export const createState = () => ({
  creatures: [
    createCreature(),
    createCreature({ player: 1, position: { x: 10, y: 100 } }),
  ],
});

export type State = ReturnType<typeof createState>;

const createCreature = ({ player = 0, position = { x: 0, y: 0 } } = {}) => ({
  player,
  health: 10,
  position,
});

export type Position = { x: number; y: number };
