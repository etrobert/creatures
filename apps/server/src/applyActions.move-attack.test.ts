import { describe, expect, test } from "vitest";
import type {
  AttackAction,
  Creature,
  GameMap,
  MoveAction,
  State,
} from "@creatures/shared/state";
import { countColumns, countRow } from "@creatures/shared/state";

import { applyAttack, applyMove } from "./applyActions.js";

// Local helpers (kept private to this file by design).

const makeMap = (voidIndices: number[] = []): GameMap => {
  const map: GameMap = Array.from(
    { length: countColumns * countRow },
    () => "grass",
  );
  for (const index of voidIndices) map[index] = "void";
  return map;
};

const tileIndex = (x: number, y: number): number => x + y * countColumns;

const makeCreature = (overrides: Partial<Creature> = {}): Creature => ({
  id: "c1",
  name: "bulbizard",
  type: "creature",
  player: "0",
  health: 10,
  maxHealth: 10,
  position: { x: 3, y: 3 },
  previousPosition: null,
  direction: "down",
  ongoingAction: null,
  ongoingActionStart: 0,
  resetOngoingActionNextTurn: false,
  nextActions: [],
  ...overrides,
});

const makeState = (entities: Creature[], map: GameMap = makeMap()): State => ({
  tick: 0,
  entities,
  map,
});

const findById = (state: State, id: string): Creature => {
  const entity = state.entities.find((e) => e.id === id);
  if (entity === undefined || entity.type !== "creature")
    throw new Error("creature not found");
  return entity;
};

describe("applyMove", () => {
  test("moving into a free tile sets previousPosition, position and direction", () => {
    const creature = makeCreature({ position: { x: 3, y: 3 } });
    const move: MoveAction = { type: "move", direction: "right" };
    const state = makeState([creature]);

    const result = applyMove(state, creature, move);
    const moved = findById(result, "c1");

    expect(moved.position).toEqual({ x: 4, y: 3 });
    expect(moved.previousPosition).toEqual({ x: 3, y: 3 });
    expect(moved.direction).toBe("right");
  });

  test("a successful move requests the ongoing action be reset next turn", () => {
    const creature = makeCreature({ position: { x: 3, y: 3 } });
    const move: MoveAction = { type: "move", direction: "right" };

    const result = applyMove(makeState([creature]), creature, move);

    expect(findById(result, "c1").resetOngoingActionNextTurn).toBe(true);
  });

  test("a move blocked by a void tile only changes direction", () => {
    const creature = makeCreature({
      position: { x: 3, y: 3 },
      direction: "down",
    });
    const move: MoveAction = { type: "move", direction: "right" };
    // Mark the target tile (4, 3) as void.
    const map = makeMap([tileIndex(4, 3)]);

    const result = applyMove(makeState([creature], map), creature, move);
    const moved = findById(result, "c1");

    expect(moved.position).toEqual({ x: 3, y: 3 });
    expect(moved.previousPosition).toBeNull();
    expect(moved.direction).toBe("right");
    // The reset flag is still raised even when the move is blocked.
    expect(moved.resetOngoingActionNextTurn).toBe(true);
  });

  test("a move blocked by the outer map boundary only changes direction", () => {
    const creature = makeCreature({
      position: { x: 0, y: 3 },
      direction: "down",
    });
    const move: MoveAction = { type: "move", direction: "left" };

    const result = applyMove(makeState([creature]), creature, move);
    const moved = findById(result, "c1");

    expect(moved.position).toEqual({ x: 0, y: 3 });
    expect(moved.previousPosition).toBeNull();
    expect(moved.direction).toBe("left");
  });

  test("a move blocked by another creature only changes direction", () => {
    const mover = makeCreature({ id: "mover", position: { x: 3, y: 3 } });
    const blocker = makeCreature({ id: "blocker", position: { x: 4, y: 3 } });
    const move: MoveAction = { type: "move", direction: "right" };

    const result = applyMove(makeState([mover, blocker]), mover, move);
    const moved = findById(result, "mover");

    expect(moved.position).toEqual({ x: 3, y: 3 });
    expect(moved.previousPosition).toBeNull();
    expect(moved.direction).toBe("right");
    // The blocker is untouched.
    expect(findById(result, "blocker").position).toEqual({ x: 4, y: 3 });
  });
});

describe("applyAttack", () => {
  test("deals 1 damage to a creature on the tile in the attack direction", () => {
    const attacker = makeCreature({ id: "attacker", position: { x: 3, y: 3 } });
    const victim = makeCreature({
      id: "victim",
      position: { x: 4, y: 3 },
      health: 10,
    });
    const attack: AttackAction = { type: "attack", direction: "right" };

    const result = applyAttack(makeState([attacker, victim]), attacker, attack);

    expect(findById(result, "victim").health).toBe(9);
    expect(findById(result, "attacker").health).toBe(10);
  });

  test("requests the ongoing action be reset next turn", () => {
    const attacker = makeCreature({ id: "attacker", position: { x: 3, y: 3 } });
    const attack: AttackAction = { type: "attack", direction: "right" };

    const result = applyAttack(makeState([attacker]), attacker, attack);

    expect(findById(result, "attacker").resetOngoingActionNextTurn).toBe(true);
  });

  test("attacking an empty tile deals no damage but still resets next turn", () => {
    const attacker = makeCreature({ id: "attacker", position: { x: 3, y: 3 } });
    const bystander = makeCreature({
      id: "bystander",
      position: { x: 1, y: 1 },
      health: 10,
    });
    const attack: AttackAction = { type: "attack", direction: "right" };

    const result = applyAttack(
      makeState([attacker, bystander]),
      attacker,
      attack,
    );

    expect(findById(result, "bystander").health).toBe(10);
    expect(findById(result, "attacker").resetOngoingActionNextTurn).toBe(true);
  });

  test("a creature reduced to 0 health is removed from the state", () => {
    const attacker = makeCreature({ id: "attacker", position: { x: 3, y: 3 } });
    const victim = makeCreature({
      id: "victim",
      position: { x: 4, y: 3 },
      health: 1,
    });
    const attack: AttackAction = { type: "attack", direction: "right" };

    const result = applyAttack(makeState([attacker, victim]), attacker, attack);

    expect(result.entities.some((e) => e.id === "victim")).toBe(false);
  });
});
