import { describe, expect, it } from "vitest";

import type {
  Creature,
  Entity,
  Position,
  State,
} from "@creatures/shared/state";

import {
  dealDamageAtPosition,
  resetEntityOngoingAction,
  updateEntityById,
} from "./actionUtilities.js";

const makeCreature = (
  id: string,
  position: Position,
  health: number,
  overrides: Partial<Creature> = {},
): Creature => ({
  id,
  name: "bulbizard",
  type: "creature",
  position,
  previousPosition: null,
  ongoingAction: null,
  ongoingActionStart: 0,
  resetOngoingActionNextTurn: false,
  nextActions: [],
  direction: "up",
  player: "player-1",
  health,
  maxHealth: 100,
  ...overrides,
});

const makeFireball = (
  id: string,
  position: Position,
  overrides: Partial<Extract<Entity, { type: "entity" }>> = {},
): Extract<Entity, { type: "entity" }> => ({
  id,
  name: "fireball",
  type: "entity",
  position,
  previousPosition: null,
  ongoingAction: null,
  ongoingActionStart: 0,
  resetOngoingActionNextTurn: false,
  nextActions: [],
  direction: "up",
  ...overrides,
});

const makeState = (entities: Entity[]): State => ({
  tick: 0,
  entities,
  map: [],
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

describe("updateEntityById", () => {
  it("applies the update fn only to the matching entity", () => {
    const a = makeCreature("a", { x: 0, y: 0 }, 50);
    const b = makeCreature("b", { x: 1, y: 1 }, 50);
    const state = makeState([a, b]);

    const result = updateEntityById(state, "a", (entity) => ({
      ...entity,
      direction: "down",
    }));

    expect(result.entities.find((e) => e.id === "a")?.direction).toBe("down");
    expect(result.entities.find((e) => e.id === "b")?.direction).toBe("up");
  });

  it("leaves non-matching entities referentially unchanged", () => {
    const a = makeCreature("a", { x: 0, y: 0 }, 50);
    const b = makeCreature("b", { x: 1, y: 1 }, 50);
    const state = makeState([a, b]);

    const result = updateEntityById(state, "a", (entity) => ({
      ...entity,
      direction: "down",
    }));

    expect(result.entities.find((e) => e.id === "b")).toBe(b);
  });

  it("returns a new state object and a new entities array (immutability)", () => {
    const a = makeCreature("a", { x: 0, y: 0 }, 50);
    const state = makeState([a]);

    const result = updateEntityById(state, "a", (entity) => ({
      ...entity,
      direction: "down",
    }));

    expect(result).not.toBe(state);
    expect(result.entities).not.toBe(state.entities);
    expect(state.entities[0]?.direction).toBe("up");
  });

  it("returns an equivalent state when no entity id matches", () => {
    const a = makeCreature("a", { x: 0, y: 0 }, 50);
    const state = makeState([a]);

    const result = updateEntityById(state, "missing", (entity) => ({
      ...entity,
      direction: "down",
    }));

    expect(result.entities).toEqual(state.entities);
    expect(result.entities[0]).toBe(a);
  });
});

describe("resetEntityOngoingAction", () => {
  it("sets resetOngoingActionNextTurn = true on the target entity", () => {
    const a = makeCreature("a", { x: 0, y: 0 }, 50);
    const b = makeCreature("b", { x: 1, y: 1 }, 50);
    const state = makeState([a, b]);

    const result = resetEntityOngoingAction(state, "a");

    expect(
      result.entities.find((e) => e.id === "a")?.resetOngoingActionNextTurn,
    ).toBe(true);
    expect(
      result.entities.find((e) => e.id === "b")?.resetOngoingActionNextTurn,
    ).toBe(false);
  });

  it("does not mutate the original state", () => {
    const a = makeCreature("a", { x: 0, y: 0 }, 50);
    const state = makeState([a]);

    resetEntityOngoingAction(state, "a");

    expect(state.entities[0]?.resetOngoingActionNextTurn).toBe(false);
  });
});

describe("dealDamageAtPosition", () => {
  it("decrements health for a creature that survives the damage", () => {
    const creature = makeCreature("c", { x: 2, y: 3 }, 50);
    const state = makeState([creature]);

    const result = dealDamageAtPosition(state, { x: 2, y: 3 }, 20);

    expect(findCreature(result, "c").health).toBe(30);
  });

  it("removes a creature whose health drops to exactly 0 (death)", () => {
    const creature = makeCreature("c", { x: 2, y: 3 }, 20);
    const state = makeState([creature]);

    const result = dealDamageAtPosition(state, { x: 2, y: 3 }, 20);

    expect(result.entities.find((e) => e.id === "c")).toBeUndefined();
    expect(result.entities).toHaveLength(0);
  });

  it("removes a creature whose health drops below 0 (death)", () => {
    const creature = makeCreature("c", { x: 2, y: 3 }, 10);
    const state = makeState([creature]);

    const result = dealDamageAtPosition(state, { x: 2, y: 3 }, 20);

    expect(result.entities.find((e) => e.id === "c")).toBeUndefined();
  });

  it("keeps a creature left at exactly 1 health", () => {
    const creature = makeCreature("c", { x: 2, y: 3 }, 21);
    const state = makeState([creature]);

    const result = dealDamageAtPosition(state, { x: 2, y: 3 }, 20);

    expect(findCreature(result, "c").health).toBe(1);
  });

  it("sweeps out an already-dead creature anywhere, not just at the damaged tile", () => {
    const target = makeCreature("target", { x: 2, y: 3 }, 50);
    const alreadyDead = makeCreature("dead", { x: 8, y: 0 }, 0);
    const state = makeState([target, alreadyDead]);

    const result = dealDamageAtPosition(state, { x: 2, y: 3 }, 20);

    // The death filter runs over every creature, not only those at the damaged
    // position, so a creature already at <= 0 health elsewhere is removed too.
    expect(result.entities.find((e) => e.id === "dead")).toBeUndefined();
    expect(findCreature(result, "target").health).toBe(30);
  });

  it("leaves creatures at other positions untouched", () => {
    const target = makeCreature("target", { x: 2, y: 3 }, 50);
    const bystander = makeCreature("bystander", { x: 4, y: 4 }, 50);
    const state = makeState([target, bystander]);

    const result = dealDamageAtPosition(state, { x: 2, y: 3 }, 20);

    expect(findCreature(result, "target").health).toBe(30);
    expect(result.entities.find((e) => e.id === "bystander")).toBe(bystander);
  });

  it("damages all creatures sharing the target position", () => {
    const first = makeCreature("first", { x: 1, y: 1 }, 50);
    const second = makeCreature("second", { x: 1, y: 1 }, 30);
    const state = makeState([first, second]);

    const result = dealDamageAtPosition(state, { x: 1, y: 1 }, 15);

    expect(findCreature(result, "first").health).toBe(35);
    expect(findCreature(result, "second").health).toBe(15);
  });

  it("does not damage or remove a non-creature entity at the same position", () => {
    const creature = makeCreature("c", { x: 5, y: 5 }, 50);
    const fireball = makeFireball("f", { x: 5, y: 5 });
    const state = makeState([creature, fireball]);

    const result = dealDamageAtPosition(state, { x: 5, y: 5 }, 20);

    const resultFireball = result.entities.find((e) => e.id === "f");
    expect(resultFireball).toBe(fireball);
    expect(findCreature(result, "c").health).toBe(30);
  });

  it("keeps a non-creature entity even when a co-located creature dies", () => {
    const creature = makeCreature("c", { x: 5, y: 5 }, 20);
    const fireball = makeFireball("f", { x: 5, y: 5 });
    const state = makeState([creature, fireball]);

    const result = dealDamageAtPosition(state, { x: 5, y: 5 }, 20);

    expect(result.entities.find((e) => e.id === "c")).toBeUndefined();
    expect(result.entities.find((e) => e.id === "f")).toBe(fireball);
  });

  it("returns a new state without mutating the original", () => {
    const creature = makeCreature("c", { x: 2, y: 3 }, 50);
    const state = makeState([creature]);

    const result = dealDamageAtPosition(state, { x: 2, y: 3 }, 20);

    expect(result).not.toBe(state);
    expect(result.entities).not.toBe(state.entities);
    expect(findCreature(state, "c").health).toBe(50);
  });
});
