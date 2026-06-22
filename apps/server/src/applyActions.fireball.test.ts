import { describe, expect, test } from "vitest";

import { findActiveCreature } from "@creatures/shared/gameLogicUtilities";
import {
  buildMap,
  findByName,
  makeCreature,
  makeEntity,
  makeState,
} from "@creatures/shared/testHelpers";
import { countColumns, type State } from "@creatures/shared/state";

import { applyFireball, applyFireballMove } from "./applyActions.js";

describe("applyFireball", () => {
  test("waits (returns state unchanged) on the warmup tick", () => {
    const caster = makeCreature({
      id: "caster",
      position: { x: 3, y: 3 },
      direction: "right",
      ongoingActionStart: 5,
    });
    const victim = makeCreature({
      id: "victim",
      name: "salameche",
      position: { x: 4, y: 3 },
      health: 10,
    });
    // tick (5) <= ongoingActionStart (5) - 1 + warmupDuration (1) => waiting.
    const state: State = {
      ...makeState([caster, victim], buildMap()),
      tick: 5,
    };

    const result = applyFireball(state, caster);

    expect(result).toBe(state);
    expect(findByName(result, "fireball")).toBeUndefined();
    expect(findActiveCreature(result, "victim").health).toBe(10);
    expect(
      findActiveCreature(result, "caster").resetOngoingActionNextTurn,
    ).toBe(false);
  });

  test("spawns a fireball ahead, damages that tile, and resets the action once past warmup", () => {
    const caster = makeCreature({
      id: "caster",
      position: { x: 3, y: 3 },
      direction: "right",
      ongoingActionStart: 5,
    });
    const victim = makeCreature({
      id: "victim",
      name: "salameche",
      position: { x: 4, y: 3 },
      health: 10,
    });
    // tick (6) > ongoingActionStart (5) => fires.
    const state: State = {
      ...makeState([caster, victim], buildMap()),
      tick: 6,
    };

    const result = applyFireball(state, caster);

    expect(result.entities.length).toBe(3);

    const fireball = findByName(result, "fireball")!;
    expect(fireball.type).toBe("entity");
    expect(fireball.position).toEqual({ x: 4, y: 3 });
    expect(fireball.direction).toBe("right");

    expect(findActiveCreature(result, "victim").health).toBe(9);
    expect(
      findActiveCreature(result, "caster").resetOngoingActionNextTurn,
    ).toBe(true);

    // The fireball is appended at the end of the entities array.
    expect(result.entities[result.entities.length - 1]).toBe(fireball);
  });
});

describe("applyFireballMove", () => {
  test("moves one tile in its direction, recording previousPosition and damaging the new tile", () => {
    const fireball = makeEntity({
      id: "fb",
      position: { x: 3, y: 3 },
      direction: "right",
    });
    const victim = makeCreature({
      id: "victim",
      name: "salameche",
      position: { x: 4, y: 3 },
      health: 10,
    });
    const state = makeState([fireball, victim], buildMap());

    const result = applyFireballMove(state, fireball);

    const movedFireball = result.entities.find((e) => e.id === "fb")!;
    expect(movedFireball.position).toEqual({ x: 4, y: 3 });
    expect(movedFireball.previousPosition).toEqual({ x: 3, y: 3 });
    expect(findActiveCreature(result, "victim").health).toBe(9);
  });

  test("is removed from entities when the next tile is off the map", () => {
    const fireball = makeEntity({
      id: "fb",
      // x = countColumns - 1: moving right steps off the map.
      position: { x: countColumns - 1, y: 3 },
      direction: "right",
    });
    const state = makeState([fireball], buildMap());

    const result = applyFireballMove(state, fireball);

    expect(result.entities.find((e) => e.id === "fb")).toBeUndefined();
    expect(result.entities).toHaveLength(0);
  });

  test("a void tile does NOT stop the fireball (only off-map collisions remove it)", () => {
    // applyFireballMove uses outerMapCollision, not collisionWithMap, so the
    // fireball moves onto a void tile instead of being destroyed.
    const fireball = makeEntity({
      id: "fb",
      position: { x: 3, y: 3 },
      direction: "right",
    });
    const state = makeState([fireball], buildMap([{ x: 4, y: 3 }]));

    const result = applyFireballMove(state, fireball);

    const movedFireball = result.entities.find((e) => e.id === "fb")!;
    expect(movedFireball.position).toEqual({ x: 4, y: 3 });
  });
});
