import {
  countColumns,
  countRow,
  type Creature,
  type Entity,
  type GameMap,
  type MoveAction,
  type Position,
  type State,
} from "./state.js";

// Shared test factories for building game entities and state. Ids come from a
// module-local counter so they are unique and explicit; tests should locate
// entities structurally, never by asserting on a specific id value.
let nextId = 0;

export const makeCreature = (overrides: Partial<Creature> = {}): Creature => ({
  id: `creature-${nextId++}`,
  name: "bulbizard",
  type: "creature",
  position: { x: 0, y: 0 },
  previousPosition: null,
  ongoingAction: null,
  ongoingActionStart: 0,
  resetOngoingActionNextTurn: false,
  nextActions: [],
  direction: "down",
  player: "player-1",
  health: 10,
  maxHealth: 10,
  ...overrides,
});

// A non-creature entity (the "entity" member of the Entity discriminated
// union). Narrowing to this member keeps the literal `type` from widening when
// overrides are spread, so no type assertion is needed.
type BasicEntity = Extract<Entity, { type: "entity" }>;

export const makeEntity = (
  overrides: Partial<BasicEntity> = {},
): BasicEntity => ({
  id: `entity-${nextId++}`,
  name: "fireball",
  type: "entity",
  position: { x: 0, y: 0 },
  previousPosition: null,
  ongoingAction: null,
  ongoingActionStart: 0,
  resetOngoingActionNextTurn: false,
  nextActions: [],
  direction: "down",
  ...overrides,
});

export const makeState = (entities: Entity[], map: GameMap = []): State => ({
  tick: 0,
  entities,
  map,
});

// A full-grid map (countColumns x countRow) that is all grass except for the
// given void tiles.
export const buildMap = (voids: Position[] = []): GameMap => {
  const map: GameMap = new Array<GameMap[number]>(countColumns * countRow).fill(
    "grass",
  );
  for (const { x, y } of voids) map[x + y * countColumns] = "void";
  return map;
};

// A full grass map covering the whole grid (countColumns x countRow).
export const grassMap = (): GameMap => buildMap();

export const move = (direction: MoveAction["direction"]): MoveAction => ({
  type: "move",
  direction,
});
