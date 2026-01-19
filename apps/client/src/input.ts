import { canvas, cellWidth, cellHeight, getGhost } from "./render.js";
import {
  activeCreatureId,
  activePlayer,
  listPlayerCreatureIds,
  setActiveCreatureId,
} from "./activePlayerCreature.js";

import {
  type Action,
  type ActionType,
  type AttackAction,
  type Creature,
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

const createFireball = (): FireballAction => ({ type: "fireball" });

const createAction = (creature: Creature, actionType: ActionType): Action => {
  switch (actionType) {
    case "attack":
      return createAttack(creature);
    case "fireball":
      return createFireball();
    default:
      throw new Error("unknown action type");
  }
};

export const setupEventListeners = () => {
  window.addEventListener("keydown", (event) => {
    if (state === undefined) throw new Error("state is undefined");
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
        case "KeyW":
          return createAction(
            activeCreature,
            getCreatureKit(activeCreature.name).actionQ,
          );
        case "KeyQ":
          return createAction(
            activeCreature,
            getCreatureKit(activeCreature.name).actionQ,
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
  });

  canvas.addEventListener("click", (event) => {
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
  });

  const pathToTarget = (
    currentPosition: Position,
    TargetPosition: Position,
  ) => {
    const nextActionsX =
      currentPosition.x < TargetPosition.x
        ? new Array(TargetPosition.x - currentPosition.x).fill({
            type: "move",
            direction: "right",
          })
        : new Array(currentPosition.x - TargetPosition.x).fill({
            type: "move",
            direction: "left",
          });
    const nextActionsY =
      currentPosition.y < TargetPosition.y
        ? new Array(TargetPosition.y - currentPosition.y).fill({
            type: "move",
            direction: "down",
          })
        : new Array(currentPosition.y - TargetPosition.y).fill({
            type: "move",
            direction: "up",
          });
    return [...nextActionsX, ...nextActionsY];
  };

  window.addEventListener("keydown", (event) => {
    const getActiveCreature = () => {
      const listActivePlayerCreatureIds = listPlayerCreatureIds(activePlayer);
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
  });
};

// translation bwtween grid position and canvas position
const canvasToGrid = ({ x, y }: Position) => ({
  x: Math.floor((x - cellWidth / 2) / cellWidth),
  y: Math.floor((y - cellHeight / 2) / cellHeight),
});
