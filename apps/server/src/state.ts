import type {
  Creature,
  Direction,
  Position,
  Projectile,
  State,
} from "@creatures/shared/state";

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
    createCreature({ player: 0, position: { x: 5, y: 5 } }),
  ],
  projectiles: [],
});

let nextProjectileId = 0;

export const createFireball = (
  tileAttacked: Position,
  direction: Direction,
): Projectile => {
  return {
    position: tileAttacked,
    direction,
    id: String(nextProjectileId++),
  } as const;
};
