import { describe, expect, test } from "vitest";
import { applyFireball, applyFireballMove } from "./applyActions.js";
import {
  countColumns,
  countRow,
  type Creature,
  type Entity,
  type GameMap,
  type Position,
  type State,
} from "@creatures/shared/state";

// Characterization tests for the fireball actions. They pin the CURRENT
// behavior of applyFireball / applyFireballMove; they do not assert what the
// code "should" do. Helpers are kept local to this file on purpose.

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
