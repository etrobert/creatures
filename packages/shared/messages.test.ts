import { describe, expect, it } from "vitest";

import {
  clientMessageSchema,
  serverMessageSchema,
} from "@creatures/shared/messages";
import type { Action, State } from "@creatures/shared/state";

// Valid action shapes covering every variant of the actionSchema discriminated
// union in state.ts. Kept local to this test file on purpose.
const moveAction: Action = { type: "move", direction: "up" };
const attackAction: Action = { type: "attack", direction: "down" };
const chargeAction: Action = { type: "charge" };
const fireballAction: Action = { type: "fireball" };
const fireballMoveAction: Action = { type: "fireball:move" };

const allActions: Action[] = [
  moveAction,
  attackAction,
  chargeAction,
  fireballAction,
  fireballMoveAction,
];

// A minimal but fully valid game state. Includes a basic entity (a fireball)
// and a creature so both variants of entitySchema are exercised.
const validState: State = {
  tick: 0,
  map: ["grass", "void"],
  entities: [
    {
      id: "fireball-1",
      name: "fireball",
      type: "entity",
      position: { x: 1, y: 2 },
      previousPosition: null,
      ongoingAction: null,
      ongoingActionStart: 0,
      resetOngoingActionNextTurn: false,
      nextActions: [],
      direction: "right",
    },
    {
      id: "creature-1",
      name: "bulbizard",
      type: "creature",
      position: { x: 3, y: 4 },
      previousPosition: { x: 2, y: 4 },
      ongoingAction: moveAction,
      ongoingActionStart: 5,
      resetOngoingActionNextTurn: true,
      nextActions: [attackAction],
      direction: "left",
      player: "player-1",
      health: 10,
      maxHealth: 20,
    },
  ],
};

describe("clientMessageSchema", () => {
  it("round-trips a 'player input' message with a creatureId and actions", () => {
    const message = {
      type: "player input" as const,
      creatureId: "creature-1",
      actions: allActions,
    };

    expect(clientMessageSchema.parse(message)).toEqual(message);
  });

  it("round-trips a 'player input' message with an empty actions array", () => {
    const message = {
      type: "player input" as const,
      creatureId: "creature-1",
      actions: [],
    };

    expect(clientMessageSchema.parse(message)).toEqual(message);
  });

  it("round-trips a 'reset actions' message with a creatureId", () => {
    const message = {
      type: "reset actions" as const,
      creatureId: "creature-1",
    };

    expect(clientMessageSchema.parse(message)).toEqual(message);
  });

  it("round-trips a 'reset state' message", () => {
    const message = { type: "reset state" as const };

    expect(clientMessageSchema.parse(message)).toEqual(message);
  });

  it("rejects an unknown message type", () => {
    expect(
      clientMessageSchema.safeParse({ type: "nope", creatureId: "creature-1" })
        .success,
    ).toBe(false);
  });

  it("rejects a 'player input' message missing the creatureId", () => {
    expect(
      clientMessageSchema.safeParse({
        type: "player input",
        actions: [],
      }).success,
    ).toBe(false);
  });

  it("rejects a 'player input' message missing the actions array", () => {
    expect(
      clientMessageSchema.safeParse({
        type: "player input",
        creatureId: "creature-1",
      }).success,
    ).toBe(false);
  });

  it("rejects a 'player input' message with an invalid action object", () => {
    expect(
      clientMessageSchema.safeParse({
        type: "player input",
        creatureId: "creature-1",
        actions: [{ type: "teleport" }],
      }).success,
    ).toBe(false);
  });

  it("rejects a 'move' action missing its direction", () => {
    expect(
      clientMessageSchema.safeParse({
        type: "player input",
        creatureId: "creature-1",
        actions: [{ type: "move" }],
      }).success,
    ).toBe(false);
  });

  it("rejects a 'reset actions' message missing the creatureId", () => {
    expect(
      clientMessageSchema.safeParse({ type: "reset actions" }).success,
    ).toBe(false);
  });
});

describe("serverMessageSchema", () => {
  it("round-trips a 'state update' message with a valid state", () => {
    const message = {
      type: "state update" as const,
      state: validState,
    };

    expect(serverMessageSchema.parse(message)).toEqual(message);
  });

  it("round-trips an 'assign player id' message with an id", () => {
    const message = {
      type: "assign player id" as const,
      id: "player-1",
    };

    expect(serverMessageSchema.parse(message)).toEqual(message);
  });

  it("rejects an unknown message type", () => {
    expect(
      serverMessageSchema.safeParse({ type: "nope", state: validState })
        .success,
    ).toBe(false);
  });

  it("rejects a 'state update' message with a malformed state", () => {
    // "lava" is not a valid tile (tileSchema only allows "grass" | "void"),
    // so the nested mapSchema rejects the state.
    expect(
      serverMessageSchema.safeParse({
        type: "state update",
        state: { tick: 0, entities: [], map: ["lava"] },
      }).success,
    ).toBe(false);
  });

  it("rejects a 'state update' message missing the state", () => {
    expect(
      serverMessageSchema.safeParse({ type: "state update" }).success,
    ).toBe(false);
  });

  it("rejects an 'assign player id' message missing the id", () => {
    expect(
      serverMessageSchema.safeParse({ type: "assign player id" }).success,
    ).toBe(false);
  });
});
