import {
  type CreatureName,
  type Direction,
  type Entity,
  type Position,
  countColumns,
  countRow,
  type Creature,
  type State,
} from "@creatures/shared/state";

let nextId = 0;

const createId = () => String(nextId++);

const createCreature = ({
  player = "0",
  position = { x: 3, y: 2 },
  name = "bulbizard",
}: Partial<Pick<Creature, "player" | "position" | "name">> = {}): Creature => ({
  name,
  id: createId(),
  type: "creature",
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
  entities: [
    createCreature(),
    createCreature({ player: "1", position: { x: 1, y: 1 } }),
    createCreature({
      player: "0",
      name: "salameche",
      position: { x: 5, y: 5 },
    }),
  ],
  map,
});

export const createFireball = (
  position: Position,
  direction: Direction,
): Entity =>
  ({
    type: "entity",
    position,
    direction,
    id: createId(),
    ongoingAction: null,
    nextActions: [{ type: "fireball:move" }],
  }) as const;

const map = new Array(countColumns * countRow).fill("grass");

map[0] = "void";
map[1] = "void";
map[16] = "void";
