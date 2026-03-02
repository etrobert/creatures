import { renderBackground } from "./background.js";
import { renderCreature } from "./renderCreature.js";
import {
  countColumns,
  countRow,
  type Position,
  type State,
  type Entity,
  tickDuration,
} from "@creatures/shared/state";
import { renderUi } from "./renderUi.js";
import { renderCreatureHealth } from "./renderCreatureHealth.js";

import {
  outerMapCollision,
  updatePosition,
  isCreature,
} from "@creatures/shared/gameLogicUtilities";
import {
  addPositions,
  multiplyPosition,
  subPositions,
} from "@creatures/shared/positionUtilities";
import { activePlayer } from "./activePlayerCreature.js";
import { tickStart } from "./state.js";

const getCanvas = () => {
  const canvas = document.querySelector("canvas");
  if (canvas === null) throw new Error("Could not get canvas");
  return canvas;
};

export const canvas = getCanvas();

const getCtx = () => {
  const ctx = canvas.getContext("2d");
  if (ctx === null) throw new Error("Could not get ctx");
  return ctx;
};

export const ctx = getCtx();

export const cellWidth = 32;
export const cellHeight = 32;
canvas.width = cellWidth * (countColumns + 1); //The canvas is 1 cell bigger because a half cell is added at left and right
canvas.height = cellHeight * (countRow + 1);

// translation bwtween grid position and canvas position
export const gridToCanvas = ({ x, y }: Position) => ({
  x: x * cellWidth + cellWidth / 2,
  y: y * cellHeight + cellHeight / 2,
});

const getCanvasPosition = (entity: Entity, currentTime: number) => {
  const canvasPosition = gridToCanvas(entity.position);
  if (entity.previousPosition === null) return canvasPosition;
  const canvasPreviousPosition = gridToCanvas(entity.previousPosition);
  const progress = (currentTime - tickStart) / tickDuration;
  const positionDifference = subPositions(
    canvasPosition,
    canvasPreviousPosition,
  );
  return addPositions(
    canvasPreviousPosition,
    multiplyPosition(positionDifference, progress),
  );
};

const renderEntity = (entity: Entity, currentTime: number) => {
  const canvasPosition = getCanvasPosition(entity, currentTime);
  renderCreature(entity, canvasPosition, currentTime);
  if (isCreature(entity)) renderCreatureHealth(entity, canvasPosition);
};

export const render = (state: State, currentTime: number) => {
  ctx.fillStyle = "lightskyblue";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  renderBackground(state.map);

  const creatureGhosts = getGhosts(state);

  for (let x = 0; x < countColumns; x++) {
    for (let y = 0; y < countRow; y++) {
      const position = { x, y };

      renderEntitiesAtPosition(state.entities, currentTime, position);

      ctx.globalAlpha = 0.5;
      renderGhostsAtPosition(creatureGhosts, currentTime, position);
      ctx.globalAlpha = 1;
    }
  }
  renderUi(state);
};

const getGhosts = (state: State) => {
  return state.entities
    .filter(isCreature)
    .filter((creature) => creature.player === activePlayer)
    .filter((creature) => creature.nextActions.length !== 0)
    .map(getGhost);
};

const renderGhostsAtPosition = (
  ghosts: Entity[],
  currentTime: number,
  position: Position,
) => {
  ghosts
    .filter(
      (ghost) =>
        ghost.position.x === position.x && ghost.position.y === position.y,
    )
    .forEach((ghost) =>
      renderCreature(ghost, gridToCanvas(ghost.position), currentTime),
    );
};

const renderEntitiesAtPosition = (
  entities: Entity[],
  currentTime: number,
  position: Position,
) => {
  entities
    .filter(
      (entity) =>
        entity.position.x === position.x && entity.position.y === position.y,
    )
    .forEach((entity) => renderEntity(entity, currentTime));
};

export const getGhost = (creature: Entity) => {
  let dummyCreature = creature;
  while (dummyCreature.nextActions[0]) {
    const [nextAction, ...nextActions] = dummyCreature.nextActions;
    dummyCreature = { ...dummyCreature, nextActions };
    if (nextAction.type === "move")
      dummyCreature = updatePosition(
        dummyCreature,
        nextAction,
        outerMapCollision,
      );
  }
  return dummyCreature;
};
