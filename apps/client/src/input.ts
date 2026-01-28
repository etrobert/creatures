import { canvas, cellWidth, cellHeight, getGhost } from "./render.js";
import {
  activeCreatureId,
  activePlayer,
  listPlayerCreatureIds,
  nextActiveCreature,
  setActiveCreatureId,
} from "./activePlayerCreature.js";

import {
  type Action,
  type ActionType,
  type AttackAction,
  type Creature,
  type ChargeAction,
  type FireballAction,
  type Position,
} from "@creatures/shared/state";

import {
  isCreature,
  findActiveCreature,
} from "@creatures/shared/gameLogicUtilities";

import { state } from "./state.js";
import { sendClientMessage } from "./socket.js";

import { getCreatureKit } from "@creatures/shared/creatureKits";
import { pathToTargetUsingBFS } from "./pathfinding.js";

const createAttack = (creature: Creature): AttackAction => ({
  type: "attack",
  direction: creature.direction,
});

const createCharge = (): ChargeAction => ({
  type: "charge",
});

const createFireball = (): FireballAction => ({ type: "fireball" });

const createAction = (creature: Creature, actionType: ActionType): Action => {
  switch (actionType) {
    case "attack":
      return createAttack(creature);
    case "charge":
      return createCharge();
    case "fireball":
      return createFireball();
    default:
      throw new Error("unknown action type");
  }
};

function createActionOnKeyDown(event: KeyboardEvent) {
  if (state === undefined) throw new Error("state is undefined");
  if (activeCreatureId === undefined)
    throw new Error("activeCreatureId is undefined");
  const activeCreature = findActiveCreature(state, activeCreatureId);

  const getAction = () => {
    switch (event.code) {
      case "ArrowUp":
        return { type: "move", direction: "up" } as const;
      case "ArrowLeft":
        return { type: "move", direction: "left" } as const;
      case "ArrowDown":
        return { type: "move", direction: "down" } as const;
      case "ArrowRight":
        return { type: "move", direction: "right" } as const;
      case "KeyQ":
        return createAction(
          activeCreature,
          getCreatureKit(activeCreature.name).actionQ,
        );
      case "KeyW":
        return createAction(
          activeCreature,
          getCreatureKit(activeCreature.name).actionW,
        );
      case "KeyE":
        return createAction(
          activeCreature,
          getCreatureKit(activeCreature.name).actionE,
        );
    }
  };

  const newAction = getAction();

  if (newAction === undefined) return;

  sendClientMessage({
    type: "player input",
    creatureId: activeCreature.id,
    actions: [newAction],
  });
}

function onCanvasClick(event: PointerEvent) {
  if (state === undefined) throw new Error("state is undefined");
  const clickPosition = canvasToGrid({ x: event.offsetX, y: event.offsetY });
  const activeCreature = state.entities
    .filter(isCreature)
    .find((creature) => creature.id === activeCreatureId);
  // add ghost calculation when in
  if (activeCreature === undefined) return;
  const ghost = getGhost(activeCreature);
  const nextActions = pathToTargetUsingBFS(
    state,
    ghost.position,
    clickPosition,
  );
  sendClientMessage({
    type: "player input",
    creatureId: activeCreature.id,
    actions: [...nextActions],
  });
}

function changeActiveCreatureOnKeyDown(event: KeyboardEvent) {
  const getActiveCreature = () => {
    if (state === undefined) throw new Error("state is undefined");
    const listActivePlayerCreatureIds = listPlayerCreatureIds(
      state,
      activePlayer,
    );
    switch (event.code) {
      case "Digit1":
        return listActivePlayerCreatureIds[0];
      case "Digit2":
        return listActivePlayerCreatureIds[1];
      case "Digit3":
        return listActivePlayerCreatureIds[2];
      case "Digit4":
        return listActivePlayerCreatureIds[3];
    }
  };

  const newActiveCreature = getActiveCreature();
  if (newActiveCreature === undefined) return;
  setActiveCreatureId(newActiveCreature);
}

const keyDownHandler = (event: KeyboardEvent) => {
  switch (event.code) {
    case "KeyN":
      sendClientMessage({ type: "reset state" });
      break;
  }

  if (activeCreatureId === undefined) return; // we're dead

  switch (event.code) {
    case "ArrowUp":
    case "ArrowLeft":
    case "ArrowDown":
    case "ArrowRight":
    case "KeyQ":
    case "KeyW":
    case "KeyE":
      createActionOnKeyDown(event);
      break;
    case "Digit1":
    case "Digit2":
    case "Digit3":
    case "Digit4":
      changeActiveCreatureOnKeyDown(event);
      break;
    case "KeyD":
      sendClientMessage({
        type: "reset actions",
        creatureId: activeCreatureId,
      });
      break;
    case "Tab":
      // This is used so that we don't tab out of the window
      event.preventDefault();
      nextActiveCreature();
      break;
  }
};

export const setupEventListeners = () => {
  canvas.addEventListener("click", onCanvasClick);

  window.addEventListener("keydown", keyDownHandler);
};

export const removeEventListeners = () => {
  canvas.removeEventListener("click", onCanvasClick);

  window.removeEventListener("keydown", keyDownHandler);
};

// translation bwtween grid position and canvas position
const canvasToGrid = ({ x, y }: Position) => ({
  x: Math.floor((x - cellWidth / 2) / cellWidth),
  y: Math.floor((y - cellHeight / 2) / cellHeight),
});
