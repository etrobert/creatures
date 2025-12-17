export const createState = () => ({
  creatures: [createCreature(), createCreature(1, { x: 10, y: 100 })],
});

export type State = ReturnType<typeof createState>;

const createCreature = (player = 0, position = { x: 0, y: 0 }) => ({
  position,
  health: 10,
  player,
});
