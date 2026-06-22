import { describe, expect, it } from "vitest";

import { findActiveCreature } from "@creatures/shared/gameLogicUtilities";
import {
  makeCreature,
  makeEntity,
  makeState,
} from "@creatures/shared/testHelpers";

import {
  dealDamageAtPosition,
  resetEntityOngoingAction,
  updateEntityById,
} from "./actionUtilities.js";

describe("updateEntityById", () => {
  it("applies the update fn only to the matching entity", () => {
    const a = makeCreature({ position: { x: 0, y: 0 } });
    const b = makeCreature({ position: { x: 1, y: 1 } });
    const state = makeState([a, b]);

    const result = updateEntityById(state, a.id, (entity) => ({
      ...entity,
      direction: "up",
    }));

    expect(result.entities.find((e) => e.id === a.id)?.direction).toBe("up");
    expect(result.entities.find((e) => e.id === b.id)?.direction).toBe("down");
  });

  it("returns a new state object and a new entities array (immutability)", () => {
    const a = makeCreature({ position: { x: 0, y: 0 } });
    const state = makeState([a]);

    const result = updateEntityById(state, a.id, (entity) => ({
      ...entity,
      direction: "up",
    }));

    expect(result).not.toBe(state);
    expect(result.entities).not.toBe(state.entities);
    expect(state.entities[0]?.direction).toBe("down");
  });

  it("returns an equivalent state when no entity id matches", () => {
    const a = makeCreature({ position: { x: 0, y: 0 } });
    const state = makeState([a]);

    const result = updateEntityById(state, "missing", (entity) => ({
      ...entity,
      direction: "up",
    }));

    expect(result.entities).toEqual(state.entities);
    expect(result.entities[0]).toBe(a);
  });
});

describe("resetEntityOngoingAction", () => {
  it("sets resetOngoingActionNextTurn = true on the target entity", () => {
    const a = makeCreature({ position: { x: 0, y: 0 } });
    const b = makeCreature({ position: { x: 1, y: 1 } });
    const state = makeState([a, b]);

    const result = resetEntityOngoingAction(state, a.id);

    expect(
      result.entities.find((e) => e.id === a.id)?.resetOngoingActionNextTurn,
    ).toBe(true);
    expect(
      result.entities.find((e) => e.id === b.id)?.resetOngoingActionNextTurn,
    ).toBe(false);
  });

  it("does not mutate the original state", () => {
    const a = makeCreature({ position: { x: 0, y: 0 } });
    const state = makeState([a]);

    resetEntityOngoingAction(state, a.id);

    expect(state.entities[0]?.resetOngoingActionNextTurn).toBe(false);
  });
});

describe("dealDamageAtPosition", () => {
  it("decrements health for a creature that survives the damage", () => {
    const creature = makeCreature({ position: { x: 2, y: 3 }, health: 50 });
    const state = makeState([creature]);

    const result = dealDamageAtPosition(state, { x: 2, y: 3 }, 20);

    expect(findActiveCreature(result, creature.id).health).toBe(30);
  });

  it("removes a creature whose health drops to exactly 0 (death)", () => {
    const creature = makeCreature({ position: { x: 2, y: 3 }, health: 20 });
    const state = makeState([creature]);

    const result = dealDamageAtPosition(state, { x: 2, y: 3 }, 20);

    expect(result.entities.find((e) => e.id === creature.id)).toBeUndefined();
    expect(result.entities).toHaveLength(0);
  });

  it("removes a creature whose health drops below 0 (death)", () => {
    const creature = makeCreature({ position: { x: 2, y: 3 }, health: 10 });
    const state = makeState([creature]);

    const result = dealDamageAtPosition(state, { x: 2, y: 3 }, 20);

    expect(result.entities.find((e) => e.id === creature.id)).toBeUndefined();
  });

  it("keeps a creature left at exactly 1 health", () => {
    const creature = makeCreature({ position: { x: 2, y: 3 }, health: 21 });
    const state = makeState([creature]);

    const result = dealDamageAtPosition(state, { x: 2, y: 3 }, 20);

    expect(findActiveCreature(result, creature.id).health).toBe(1);
  });

  it("leaves creatures at other positions untouched", () => {
    const target = makeCreature({ position: { x: 2, y: 3 }, health: 50 });
    const bystander = makeCreature({ position: { x: 4, y: 4 }, health: 50 });
    const state = makeState([target, bystander]);

    const result = dealDamageAtPosition(state, { x: 2, y: 3 }, 20);

    expect(findActiveCreature(result, target.id).health).toBe(30);
    expect(result.entities.find((e) => e.id === bystander.id)).toBe(bystander);
  });

  it("does not damage or remove a non-creature entity at the same position", () => {
    const creature = makeCreature({ position: { x: 5, y: 5 }, health: 50 });
    const fireball = makeEntity({ position: { x: 5, y: 5 } });
    const state = makeState([creature, fireball]);

    const result = dealDamageAtPosition(state, { x: 5, y: 5 }, 20);

    expect(result.entities.find((e) => e.id === fireball.id)).toBe(fireball);
    expect(findActiveCreature(result, creature.id).health).toBe(30);
  });

  it("keeps a non-creature entity even when a co-located creature dies", () => {
    const creature = makeCreature({ position: { x: 5, y: 5 }, health: 20 });
    const fireball = makeEntity({ position: { x: 5, y: 5 } });
    const state = makeState([creature, fireball]);

    const result = dealDamageAtPosition(state, { x: 5, y: 5 }, 20);

    expect(result.entities.find((e) => e.id === creature.id)).toBeUndefined();
    expect(result.entities.find((e) => e.id === fireball.id)).toBe(fireball);
  });

  it("returns a new state without mutating the original", () => {
    const creature = makeCreature({ position: { x: 2, y: 3 }, health: 50 });
    const state = makeState([creature]);

    const result = dealDamageAtPosition(state, { x: 2, y: 3 }, 20);

    expect(result).not.toBe(state);
    expect(result.entities).not.toBe(state.entities);
    expect(findActiveCreature(state, creature.id).health).toBe(50);
  });
});
