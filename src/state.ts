export const createState = () => ({ creature1: createCreature() });

export type State = ReturnType<typeof createState>;

const createCreature = () => ({
  position: { x: 0, y: 0 },
  health: 10,
  player: 1,
});
