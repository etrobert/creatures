import { describe, expect, test } from "vitest";
import type {
  Creature,
  GameMap,
  MoveAction,
  State,
} from "@creatures/shared/state";
import { countColumns, countRow } from "@creatures/shared/state";

import { updateEntity } from "./updateEntity.js";

// Local helpers (kept private to this file by design).

const grassMap = (): GameMap =>
  Array.from({ length: countColumns * countRow }, () => "grass");

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

const makeState = (entities: Creature[], tick = 0): State => ({
  tick,
  entities,
  map: grassMap(),
});

const findById = (state: State, id: string): Creature => {
  const entity = state.entities.find((e) => e.id === id);
  if (entity === undefined || entity.type !== "creature")
    throw new Error("creature not found");
  return entity;
};

describe("updateEntity lifecycle", () => {
  test("clears previousPosition at the start of the turn", () => {
    const creature = makeCreature({
      previousPosition: { x: 1, y: 1 },
    });
    const state = makeState([creature]);

    const result = updateEntity(state, "c1");

    expect(findById(result, "c1").previousPosition).toBeNull();
  });

  test("promotes the first nextAction to ongoingAction, recording start tick and shifting the queue", () => {
    const moveRight: MoveAction = { type: "move", direction: "right" };
    const attackUp = { type: "attack", direction: "up" } as const;
    const creature = makeCreature({
      ongoingAction: null,
      nextActions: [moveRight, attackUp],
    });
    const state = makeState([creature], 7);

    const result = updateEntity(state, "c1");
    const updated = findById(result, "c1");

    expect(updated.ongoingAction).toEqual(moveRight);
    expect(updated.ongoingActionStart).toBe(7);
    expect(updated.nextActions).toEqual([attackUp]);
  });

  test("does not promote a queued action while one is already ongoing", () => {
    const ongoing: MoveAction = { type: "move", direction: "right" };
    const queued = { type: "attack", direction: "up" } as const;
    const creature = makeCreature({
      ongoingAction: ongoing,
      resetOngoingActionNextTurn: false,
      nextActions: [queued],
    });
    const state = makeState([creature], 2);

    const result = updateEntity(state, "c1");
    const updated = findById(result, "c1");

    // The ongoing action is kept and the queue is left untouched.
    expect(updated.ongoingAction).toEqual(ongoing);
    expect(updated.nextActions).toEqual([queued]);
  });

  test("clears ongoingAction when resetOngoingActionNextTurn is set", () => {
    const creature = makeCreature({
      ongoingAction: { type: "move", direction: "right" },
      resetOngoingActionNextTurn: true,
      position: { x: 3, y: 3 },
      nextActions: [],
    });
    const state = makeState([creature]);

    const result = updateEntity(state, "c1");
    const updated = findById(result, "c1");

    expect(updated.ongoingAction).toBeNull();
    expect(updated.resetOngoingActionNextTurn).toBe(false);
    // No action remained to apply, so position is unchanged.
    expect(updated.position).toEqual({ x: 3, y: 3 });
  });

  test("runs a move action through the full promote-apply-reset cycle over two turns", () => {
    const moveRight: MoveAction = { type: "move", direction: "right" };
    const creature = makeCreature({
      position: { x: 3, y: 3 },
      nextActions: [moveRight],
    });

    // Turn 1: the queued move is promoted and applied.
    const afterTurn1 = updateEntity(makeState([creature], 0), "c1");
    const turn1 = findById(afterTurn1, "c1");
    expect(turn1.ongoingAction).toEqual(moveRight);
    expect(turn1.ongoingActionStart).toBe(0);
    expect(turn1.position).toEqual({ x: 4, y: 3 });
    expect(turn1.previousPosition).toEqual({ x: 3, y: 3 });
    expect(turn1.resetOngoingActionNextTurn).toBe(true);
    expect(turn1.nextActions).toEqual([]);

    // Turn 2: the reset flag clears the ongoing action and previousPosition.
    const afterTurn2 = updateEntity({ ...afterTurn1, tick: 1 }, "c1");
    const turn2 = findById(afterTurn2, "c1");
    expect(turn2.ongoingAction).toBeNull();
    expect(turn2.resetOngoingActionNextTurn).toBe(false);
    expect(turn2.previousPosition).toBeNull();
    expect(turn2.position).toEqual({ x: 4, y: 3 });
  });

  test("dispatches an ongoing attack action and deals damage to the target", () => {
    const attacker = makeCreature({
      id: "attacker",
      position: { x: 3, y: 3 },
      ongoingAction: { type: "attack", direction: "right" },
      ongoingActionStart: 0,
    });
    const victim = makeCreature({
      id: "victim",
      position: { x: 4, y: 3 },
      health: 10,
    });
    const state = makeState([attacker, victim]);

    const result = updateEntity(state, "attacker");

    expect(findById(result, "victim").health).toBe(9);
  });
});
