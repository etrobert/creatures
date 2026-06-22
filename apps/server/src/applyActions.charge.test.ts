import { describe, expect, test } from "vitest";
import { applyCharge } from "./applyActions.js";
import {
  countColumns,
  countRow,
  type Creature,
  type GameMap,
  type Position,
  type State,
} from "@creatures/shared/state";

// Characterization tests for the charge action. They pin the CURRENT behavior
// of applyCharge; they do not assert what the code "should" do. Helpers are
// kept local to this file on purpose.

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

// Locate a creature by id and narrow it from the Entity union without a type
// assertion; throws if it is missing or not a creature, which fails the test
// with a clear message instead of a silent `undefined`.
const findCreature = (state: State, id: string): Creature => {
  const entity = state.entities.find((e) => e.id === id);
  if (entity?.type !== "creature") {
    throw new Error(`expected a creature with id "${id}"`);
  }
  return entity;
};

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
    const damaged1 = findCreature(result, "passed1");
    const damaged2 = findCreature(result, "passed2");
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
    expect(findCreature(result, "blocker").health).toBe(9);
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
    expect(findCreature(result, "passed").health).toBe(9);
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
    expect(findCreature(result, "occupant").health).toBe(10);
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
