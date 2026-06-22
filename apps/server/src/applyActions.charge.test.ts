import { describe, expect, test } from "vitest";

import { findActiveCreature } from "@creatures/shared/gameLogicUtilities";
import {
  buildMap,
  makeCreature,
  makeState,
} from "@creatures/shared/testHelpers";

import { applyCharge } from "./applyActions.js";

// Characterization tests for the charge action. They pin the CURRENT behavior
// of applyCharge; they do not assert what the code "should" do.

describe("applyCharge", () => {
  test("charges the full 3 tiles ahead, damaging tiles passed through but not the destination", () => {
    const charger = makeCreature({
      position: { x: 1, y: 1 },
      direction: "right",
    });
    const passed1 = makeCreature({ position: { x: 2, y: 1 }, health: 10 });
    const passed2 = makeCreature({ position: { x: 3, y: 1 }, health: 10 });
    const state = makeState([charger, passed1, passed2], buildMap());

    const result = applyCharge(state, charger);

    const movedCharger = findActiveCreature(result, charger.id);
    expect(movedCharger.position).toEqual({ x: 4, y: 1 });
    expect(movedCharger.previousPosition).toEqual({ x: 1, y: 1 });
    expect(movedCharger.resetOngoingActionNextTurn).toBe(true);

    // Both tiles passed through take 1 damage; the destination tile is empty.
    expect(findActiveCreature(result, passed1.id).health).toBe(9);
    expect(findActiveCreature(result, passed2.id).health).toBe(9);
  });

  test("creatures in the path do NOT block the charge (only the destination tile is checked)", () => {
    // A creature sitting on the path is passed through and damaged rather than
    // stopping the charge short.
    const charger = makeCreature({
      position: { x: 1, y: 1 },
      direction: "right",
    });
    const blocker = makeCreature({ position: { x: 2, y: 1 } });
    const state = makeState([charger, blocker], buildMap());

    const result = applyCharge(state, charger);

    const movedCharger = findActiveCreature(result, charger.id);
    expect(movedCharger.position).toEqual({ x: 4, y: 1 });
    expect(findActiveCreature(result, blocker.id).health).toBe(9);
  });

  test("stops at the farthest valid tile when the destination tile is void", () => {
    const charger = makeCreature({
      position: { x: 1, y: 1 },
      direction: "right",
    });
    const passed = makeCreature({ position: { x: 2, y: 1 } });
    // Third tile (4,1) is void, so the charge lands on the second tile (3,1).
    const state = makeState([charger, passed], buildMap([{ x: 4, y: 1 }]));

    const result = applyCharge(state, charger);

    const movedCharger = findActiveCreature(result, charger.id);
    expect(movedCharger.position).toEqual({ x: 3, y: 1 });
    expect(movedCharger.previousPosition).toEqual({ x: 1, y: 1 });
    // Only the single tile passed through is damaged.
    expect(findActiveCreature(result, passed.id).health).toBe(9);
  });

  test("stops short when the destination tile is occupied by a creature", () => {
    const charger = makeCreature({
      position: { x: 1, y: 1 },
      direction: "right",
    });
    // Occupies the natural 3-tile destination (4,1), so the charge lands on
    // (3,1) instead — exercising the creature-occupancy branch of
    // isValidChargeDestination (distinct from the void branch above).
    const occupant = makeCreature({ position: { x: 4, y: 1 }, health: 10 });
    const state = makeState([charger, occupant], buildMap());

    const result = applyCharge(state, charger);

    const movedCharger = findActiveCreature(result, charger.id);
    expect(movedCharger.position).toEqual({ x: 3, y: 1 });
    // The blocking creature sits beyond the landing tile, so it takes no damage.
    expect(findActiveCreature(result, occupant.id).health).toBe(10);
  });

  test("kills and removes a path creature reduced to 0 health", () => {
    const charger = makeCreature({
      position: { x: 1, y: 1 },
      direction: "right",
    });
    const victim = makeCreature({ position: { x: 2, y: 1 }, health: 1 });
    const state = makeState([charger, victim], buildMap());

    const result = applyCharge(state, charger);

    expect(result.entities.some((e) => e.id === victim.id)).toBe(false);
  });

  test("does not move and only resets the action when blocked immediately", () => {
    const charger = makeCreature({
      position: { x: 1, y: 1 },
      direction: "right",
    });
    // All three tiles ahead are void: no valid destination.
    const state = makeState(
      [charger],
      buildMap([
        { x: 2, y: 1 },
        { x: 3, y: 1 },
        { x: 4, y: 1 },
      ]),
    );

    const result = applyCharge(state, charger);

    const sameCharger = findActiveCreature(result, charger.id);
    expect(sameCharger.position).toEqual({ x: 1, y: 1 });
    expect(sameCharger.previousPosition).toBeNull();
    expect(sameCharger.resetOngoingActionNextTurn).toBe(true);
  });
});
