import { describe, expect, test } from "vitest";
import {
  collisionWithMap,
  findActiveCreature,
  getCreatureAtPosition,
  getEntity,
  getNewPosition,
  getTile,
  isCreature,
  mapCollision,
  outerMapCollision,
  samePosition,
  updatePosition,
} from "@creatures/shared/gameLogicUtilities";
import {
  countColumns,
  countRow,
  type Creature,
  type Entity,
  type GameMap,
  type MoveAction,
  type Position,
  type State,
} from "@creatures/shared/state";

// Local builders. Entity ids come from production code's mutable counter in
// other paths, but here we construct entities by hand so ids are explicit and
// arbitrary; tests below never assert on specific id values structurally.
let nextId = 0;

const makeCreature = (overrides: Partial<Creature> = {}): Creature => ({
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

const makeEntity = (overrides: Partial<Entity> = {}): Entity =>
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

const makeState = (entities: Entity[], map: GameMap = []): State => ({
  tick: 0,
  entities,
  map,
});

// A full grass map covering the whole grid (countColumns x countRow).
const grassMap = (): GameMap =>
  new Array<"grass">(countColumns * countRow).fill("grass");

const move = (direction: MoveAction["direction"]): MoveAction => ({
  type: "move",
  direction,
});

describe("getNewPosition", () => {
  const start: Position = { x: 4, y: 3 };

  test("up decrements y", () => {
    expect(getNewPosition(start, "up")).toEqual({ x: 4, y: 2 });
  });

  test("down increments y", () => {
    expect(getNewPosition(start, "down")).toEqual({ x: 4, y: 4 });
  });

  test("right increments x", () => {
    expect(getNewPosition(start, "right")).toEqual({ x: 5, y: 3 });
  });

  test("left decrements x", () => {
    expect(getNewPosition(start, "left")).toEqual({ x: 3, y: 3 });
  });

  test("does not mutate the input position", () => {
    getNewPosition(start, "up");
    expect(start).toEqual({ x: 4, y: 3 });
  });
});

describe("outerMapCollision", () => {
  test("returns false for an in-bounds position", () => {
    expect(outerMapCollision({ x: 0, y: 0 })).toBe(false);
    expect(outerMapCollision({ x: countColumns - 1, y: countRow - 1 })).toBe(
      false,
    );
  });

  test("returns true for negative coordinates", () => {
    expect(outerMapCollision({ x: -1, y: 0 })).toBe(true);
    expect(outerMapCollision({ x: 0, y: -1 })).toBe(true);
  });

  test("returns true when x reaches countColumns", () => {
    expect(outerMapCollision({ x: countColumns, y: 0 })).toBe(true);
  });

  test("returns true when y reaches countRow", () => {
    expect(outerMapCollision({ x: 0, y: countRow })).toBe(true);
  });
});

describe("getTile", () => {
  test("returns the tile at the linear index x + y * countColumns", () => {
    const map = grassMap();
    map[2 + 1 * countColumns] = "void";
    expect(getTile(map, { x: 2, y: 1 })).toBe("void");
    expect(getTile(map, { x: 3, y: 1 })).toBe("grass");
  });

  test("returns the tile at the origin", () => {
    const map = grassMap();
    map[0] = "void";
    expect(getTile(map, { x: 0, y: 0 })).toBe("void");
  });

  test("throws on an out-of-range index", () => {
    const map = grassMap();
    expect(() => getTile(map, { x: 0, y: countRow })).toThrow(
      "incorrect position",
    );
  });
});

describe("mapCollision", () => {
  test("returns true on a void tile", () => {
    const map = grassMap();
    map[3 + 2 * countColumns] = "void";
    expect(mapCollision(map, { x: 3, y: 2 })).toBe(true);
  });

  test("returns false on a grass tile", () => {
    const map = grassMap();
    expect(mapCollision(map, { x: 3, y: 2 })).toBe(false);
  });
});

describe("collisionWithMap", () => {
  test("returns true for an out-of-bounds position without reading the map", () => {
    // Empty map: if getTile were reached it would throw. Short-circuit on
    // outerMapCollision means this stays false-free of throws and returns true.
    expect(collisionWithMap([], { x: -1, y: 0 })).toBe(true);
  });

  test("returns true for an in-bounds void tile", () => {
    const map = grassMap();
    map[4 + 3 * countColumns] = "void";
    expect(collisionWithMap(map, { x: 4, y: 3 })).toBe(true);
  });

  test("returns false for an in-bounds grass tile", () => {
    expect(collisionWithMap(grassMap(), { x: 4, y: 3 })).toBe(false);
  });
});

describe("updatePosition", () => {
  test("when no collision: moves, records previousPosition, and sets direction", () => {
    const creature = makeCreature({ position: { x: 2, y: 2 } });
    const updated = updatePosition(creature, move("right"), () => false);

    expect(updated.position).toEqual({ x: 3, y: 2 });
    expect(updated.previousPosition).toEqual({ x: 2, y: 2 });
    expect(updated.direction).toBe("right");
  });

  test("when collision: only direction changes, position is untouched", () => {
    const creature = makeCreature({
      position: { x: 2, y: 2 },
      previousPosition: { x: 9, y: 9 },
      direction: "down",
    });
    const updated = updatePosition(creature, move("up"), () => true);

    expect(updated.position).toEqual({ x: 2, y: 2 });
    expect(updated.previousPosition).toEqual({ x: 9, y: 9 });
    expect(updated.direction).toBe("up");
  });

  test("does not mutate the original entity", () => {
    const creature = makeCreature({ position: { x: 2, y: 2 } });
    updatePosition(creature, move("right"), () => false);
    expect(creature.position).toEqual({ x: 2, y: 2 });
    expect(creature.previousPosition).toBeNull();
    expect(creature.direction).toBe("down");
  });

  test("passes the would-be new position to the collision predicate", () => {
    const creature = makeCreature({ position: { x: 5, y: 5 } });
    let received: Position | undefined;
    updatePosition(creature, move("left"), (newPosition) => {
      received = newPosition;
      return false;
    });
    expect(received).toEqual({ x: 4, y: 5 });
  });
});

describe("isCreature", () => {
  test("returns true for a creature entity", () => {
    expect(isCreature(makeCreature())).toBe(true);
  });

  test("returns false for a non-creature entity", () => {
    expect(isCreature(makeEntity())).toBe(false);
  });
});

describe("getCreatureAtPosition", () => {
  test("returns the creature standing at the position", () => {
    const target = makeCreature({ position: { x: 3, y: 4 } });
    const other = makeCreature({ position: { x: 0, y: 0 } });
    const state = makeState([other, target]);

    expect(getCreatureAtPosition(state, { x: 3, y: 4 })).toBe(target);
  });

  test("returns undefined when no creature is at the position", () => {
    const state = makeState([makeCreature({ position: { x: 0, y: 0 } })]);
    expect(getCreatureAtPosition(state, { x: 5, y: 5 })).toBeUndefined();
  });

  test("returns the first creature when several share the position", () => {
    const first = makeCreature({ position: { x: 1, y: 1 } });
    const second = makeCreature({ position: { x: 1, y: 1 } });
    const state = makeState([first, second]);

    // Pins the Array.find first-match ordering (entities array order wins).
    expect(getCreatureAtPosition(state, { x: 1, y: 1 })).toBe(first);
  });

  test("ignores non-creature entities sharing the position", () => {
    const entity = makeEntity({ position: { x: 2, y: 2 } });
    const state = makeState([entity]);
    expect(getCreatureAtPosition(state, { x: 2, y: 2 })).toBeUndefined();
  });
});

describe("samePosition", () => {
  test("returns true for equal positions", () => {
    expect(samePosition({ x: 1, y: 2 }, { x: 1, y: 2 })).toBe(true);
  });

  test("returns false when x differs", () => {
    expect(samePosition({ x: 1, y: 2 }, { x: 9, y: 2 })).toBe(false);
  });

  test("returns false when y differs", () => {
    expect(samePosition({ x: 1, y: 2 }, { x: 1, y: 9 })).toBe(false);
  });
});

describe("findActiveCreature", () => {
  test("returns the creature with the matching id", () => {
    const creature = makeCreature();
    const state = makeState([makeEntity(), creature]);
    expect(findActiveCreature(state, creature.id)).toBe(creature);
  });

  test("throws when no entity has the id", () => {
    const state = makeState([makeCreature()]);
    expect(() => findActiveCreature(state, "missing")).toThrow(
      "Couldn't find active creature",
    );
  });

  test("throws when the matched entity is not a creature", () => {
    const entity = makeEntity();
    const state = makeState([entity]);
    expect(() => findActiveCreature(state, entity.id)).toThrow(
      "Active creature is not a creature",
    );
  });
});

describe("getEntity", () => {
  test("returns the entity with the matching id", () => {
    const entity = makeEntity();
    const state = makeState([makeCreature(), entity]);
    expect(getEntity(state, entity.id)).toBe(entity);
  });

  test("returns a creature entity by id", () => {
    const creature = makeCreature();
    const state = makeState([creature]);
    expect(getEntity(state, creature.id)).toBe(creature);
  });

  test("throws when no entity has the id", () => {
    const state = makeState([makeCreature()]);
    expect(() => getEntity(state, "missing")).toThrow("entity not found");
  });
});
