import {
  countColumns,
  countRow,
  type Creature,
  type Entity,
  type GameMap,
  type MoveAction,
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

export const makeEntity = (overrides: Partial<Entity> = {}): Entity =>
  ({
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
  }) as Entity;

export const makeState = (entities: Entity[], map: GameMap = []): State => ({
  tick: 0,
  entities,
  map,
});

// A full grass map covering the whole grid (countColumns x countRow).
export const grassMap = (): GameMap =>
  new Array<"grass">(countColumns * countRow).fill("grass");

export const move = (direction: MoveAction["direction"]): MoveAction => ({
  type: "move",
  direction,
});
