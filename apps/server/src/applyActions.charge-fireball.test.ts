import { describe, expect, test } from "vitest";
import {
  applyCharge,
  applyFireball,
  applyFireballMove,
} from "./applyActions.js";
import {
  countColumns,
  countRow,
  type Creature,
  type Entity,
  type GameMap,
  type Position,
  type State,
} from "@creatures/shared/state";

// Characterization tests for the charge and fireball actions. They pin the
// CURRENT behavior of applyCharge / applyFireball / applyFireballMove; they do
// not assert what the code "should" do. Helpers are kept local to this file on
// purpose (parallel agents would collide on a shared fixtures file).

const buildMap = (voids: Position[] = []): GameMap => {
  const map: GameMap = new Array(countColumns * countRow).fill("grass");
  for (const { x, y } of voids) map[x + y * countColumns] = "void";
  return map;
};

const createTestCreature = (overrides: Partial<Creature> = {}): Creature => ({
  id: "creature",
  name: "bulbizard",
  type: "creature",
  player: "0",
  health: 10,
  maxHealth: 10,
  position: { x: 0, y: 0 },
  previousPosition: null,
  direction: "down",
  ongoingAction: null,
  ongoingActionStart: 0,
  resetOngoingActionNextTurn: false,
  nextActions: [],
  ...overrides,
});

const createTestFireball = (overrides: Partial<Entity> = {}): Entity =>
  ({
    id: "fireball",
    name: "fireball",
    type: "entity",
    position: { x: 0, y: 0 },
    previousPosition: null,
    direction: "right",
    ongoingAction: null,
    ongoingActionStart: 0,
    resetOngoingActionNextTurn: false,
    nextActions: [{ type: "fireball:move" }],
    ...overrides,
  }) as Entity;

const findByName = (state: State, name: string): Entity | undefined =>
  state.entities.find((entity) => entity.name === name);

describe("applyCharge", () => {
  test("charges the full 3 tiles ahead, damaging tiles passed through but not the destination", () => {
    const charger = createTestCreature({
      id: "charger",
      position: { x: 1, y: 1 },
      direction: "right",
    });
    const passed1 = createTestCreature({
      id: "passed1",
      name: "salameche",
      position: { x: 2, y: 1 },
      health: 10,
    });
    const passed2 = createTestCreature({
      id: "passed2",
      name: "salameche",
      position: { x: 3, y: 1 },
      health: 10,
    });
    const state: State = {
      tick: 0,
      entities: [charger, passed1, passed2],
      map: buildMap(),
    };

    const result = applyCharge(state, charger);

    const movedCharger = result.entities.find((e) => e.id === "charger")!;
    expect(movedCharger.position).toEqual({ x: 4, y: 1 });
    expect(movedCharger.previousPosition).toEqual({ x: 1, y: 1 });
    expect(movedCharger.resetOngoingActionNextTurn).toBe(true);

    // Both tiles passed through take 1 damage; the destination tile is empty.
    const damaged1 = result.entities.find(
      (e) => e.id === "passed1",
    ) as Creature;
    const damaged2 = result.entities.find(
      (e) => e.id === "passed2",
    ) as Creature;
    expect(damaged1.health).toBe(9);
    expect(damaged2.health).toBe(9);
  });

  test("creatures in the path do NOT block the charge (only the destination tile is checked)", () => {
    // A creature sitting on the path is passed through and damaged rather than
    // stopping the charge short.
    const charger = createTestCreature({
      id: "charger",
      position: { x: 1, y: 1 },
      direction: "right",
    });
    const blocker = createTestCreature({
      id: "blocker",
      name: "salameche",
      position: { x: 2, y: 1 },
    });
    const state: State = {
      tick: 0,
      entities: [charger, blocker],
      map: buildMap(),
    };

    const result = applyCharge(state, charger);

    const movedCharger = result.entities.find((e) => e.id === "charger")!;
    expect(movedCharger.position).toEqual({ x: 4, y: 1 });
    expect(
      (result.entities.find((e) => e.id === "blocker") as Creature).health,
    ).toBe(9);
  });

  test("stops at the farthest valid tile when the destination tile is void", () => {
    const charger = createTestCreature({
      id: "charger",
      position: { x: 1, y: 1 },
      direction: "right",
    });
    const passed = createTestCreature({
      id: "passed",
      name: "salameche",
      position: { x: 2, y: 1 },
    });
    const state: State = {
      tick: 0,
      entities: [charger, passed],
      // Third tile (4,1) is void, so the charge lands on the second tile (3,1).
      map: buildMap([{ x: 4, y: 1 }]),
    };

    const result = applyCharge(state, charger);

    const movedCharger = result.entities.find((e) => e.id === "charger")!;
    expect(movedCharger.position).toEqual({ x: 3, y: 1 });
    expect(movedCharger.previousPosition).toEqual({ x: 1, y: 1 });
    // Only the single tile passed through is damaged.
    expect(
      (result.entities.find((e) => e.id === "passed") as Creature).health,
    ).toBe(9);
  });

  test("stops short when the destination tile is occupied by a creature", () => {
    const charger = createTestCreature({
      id: "charger",
      position: { x: 1, y: 1 },
      direction: "right",
    });
    // Occupies the natural 3-tile destination (4,1), so the charge lands on
    // (3,1) instead — exercising the creature-occupancy branch of
    // isValidChargeDestination (distinct from the void branch above).
    const occupant = createTestCreature({
      id: "occupant",
      name: "salameche",
      position: { x: 4, y: 1 },
      health: 10,
    });
    const state: State = {
      tick: 0,
      entities: [charger, occupant],
      map: buildMap(),
    };

    const result = applyCharge(state, charger);

    const movedCharger = result.entities.find((e) => e.id === "charger")!;
    expect(movedCharger.position).toEqual({ x: 3, y: 1 });
    // The blocking creature sits beyond the landing tile, so it takes no damage.
    expect(
      (result.entities.find((e) => e.id === "occupant") as Creature).health,
    ).toBe(10);
  });

  test("kills and removes a path creature reduced to 0 health", () => {
    const charger = createTestCreature({
      id: "charger",
      position: { x: 1, y: 1 },
      direction: "right",
    });
    const victim = createTestCreature({
      id: "victim",
      name: "salameche",
      position: { x: 2, y: 1 },
      health: 1,
    });
    const state: State = {
      tick: 0,
      entities: [charger, victim],
      map: buildMap(),
    };

    const result = applyCharge(state, charger);

    expect(result.entities.some((e) => e.id === "victim")).toBe(false);
  });

  test("does not move and only resets the action when blocked immediately", () => {
    const charger = createTestCreature({
      id: "charger",
      position: { x: 1, y: 1 },
      direction: "right",
    });
    const state: State = {
      tick: 0,
      entities: [charger],
      // All three tiles ahead are void: no valid destination.
      map: buildMap([
        { x: 2, y: 1 },
        { x: 3, y: 1 },
        { x: 4, y: 1 },
      ]),
    };

    const result = applyCharge(state, charger);

    const sameCharger = result.entities.find((e) => e.id === "charger")!;
    expect(sameCharger.position).toEqual({ x: 1, y: 1 });
    expect(sameCharger.previousPosition).toBeNull();
    expect(sameCharger.resetOngoingActionNextTurn).toBe(true);
  });
});

describe("applyFireball", () => {
  test("waits (returns state unchanged) on the warmup tick", () => {
    const caster = createTestCreature({
      id: "caster",
      position: { x: 3, y: 3 },
      direction: "right",
      ongoingActionStart: 5,
    });
    const victim = createTestCreature({
      id: "victim",
      name: "salameche",
      position: { x: 4, y: 3 },
      health: 10,
    });
    const state: State = {
      // tick (5) <= ongoingActionStart (5) - 1 + warmupDuration (1) => waiting.
      tick: 5,
      entities: [caster, victim],
      map: buildMap(),
    };

    const result = applyFireball(state, caster);

    expect(result).toBe(state);
    expect(findByName(result, "fireball")).toBeUndefined();
    expect(
      (result.entities.find((e) => e.id === "victim") as Creature).health,
    ).toBe(10);
    expect(
      result.entities.find((e) => e.id === "caster")!
        .resetOngoingActionNextTurn,
    ).toBe(false);
  });

  test("spawns a fireball ahead, damages that tile, and resets the action once past warmup", () => {
    const caster = createTestCreature({
      id: "caster",
      position: { x: 3, y: 3 },
      direction: "right",
      ongoingActionStart: 5,
    });
    const victim = createTestCreature({
      id: "victim",
      name: "salameche",
      position: { x: 4, y: 3 },
      health: 10,
    });
    const state: State = {
      // tick (6) > ongoingActionStart (5) => fires.
      tick: 6,
      entities: [caster, victim],
      map: buildMap(),
    };

    const result = applyFireball(state, caster);

    expect(result.entities.length).toBe(3);

    const fireball = findByName(result, "fireball")!;
    expect(fireball.type).toBe("entity");
    expect(fireball.position).toEqual({ x: 4, y: 3 });
    expect(fireball.direction).toBe("right");

    expect(
      (result.entities.find((e) => e.id === "victim") as Creature).health,
    ).toBe(9);
    expect(
      result.entities.find((e) => e.id === "caster")!
        .resetOngoingActionNextTurn,
    ).toBe(true);

    // The fireball is appended at the end of the entities array.
    expect(result.entities[result.entities.length - 1]).toBe(fireball);
  });
});

describe("applyFireballMove", () => {
  test("moves one tile in its direction, recording previousPosition and damaging the new tile", () => {
    const fireball = createTestFireball({
      id: "fb",
      position: { x: 3, y: 3 },
      direction: "right",
    });
    const victim = createTestCreature({
      id: "victim",
      name: "salameche",
      position: { x: 4, y: 3 },
      health: 10,
    });
    const state: State = {
      tick: 0,
      entities: [fireball, victim],
      map: buildMap(),
    };

    const result = applyFireballMove(state, fireball);

    const movedFireball = result.entities.find((e) => e.id === "fb")!;
    expect(movedFireball.position).toEqual({ x: 4, y: 3 });
    expect(movedFireball.previousPosition).toEqual({ x: 3, y: 3 });
    expect(
      (result.entities.find((e) => e.id === "victim") as Creature).health,
    ).toBe(9);
  });

  test("is removed from entities when the next tile is off the map", () => {
    const fireball = createTestFireball({
      id: "fb",
      // x = countColumns - 1: moving right steps off the map.
      position: { x: countColumns - 1, y: 3 },
      direction: "right",
    });
    const state: State = {
      tick: 0,
      entities: [fireball],
      map: buildMap(),
    };

    const result = applyFireballMove(state, fireball);

    expect(result.entities.find((e) => e.id === "fb")).toBeUndefined();
    expect(result.entities).toHaveLength(0);
  });

  test("a void tile does NOT stop the fireball (only off-map collisions remove it)", () => {
    // applyFireballMove uses outerMapCollision, not collisionWithMap, so the
    // fireball moves onto a void tile instead of being destroyed.
    const fireball = createTestFireball({
      id: "fb",
      position: { x: 3, y: 3 },
      direction: "right",
    });
    const state: State = {
      tick: 0,
      entities: [fireball],
      map: buildMap([{ x: 4, y: 3 }]),
    };

    const result = applyFireballMove(state, fireball);

    const movedFireball = result.entities.find((e) => e.id === "fb")!;
    expect(movedFireball.position).toEqual({ x: 4, y: 3 });
  });
});
