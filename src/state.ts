export const createState = () => ({ position: { x: 0, y: 0 } });

export type State = ReturnType<typeof createState>;
