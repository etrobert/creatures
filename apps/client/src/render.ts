import { renderBackground } from "./background.js";
import { renderCreature } from "./renderCreature.js";
import {
  countColumns,
  countRow,
  type Position,
  type State,
  type Creature,
  type Entity,
} from "@creatures/shared/state";
import { renderUi } from "./renderUi.js";
import { renderCreatureHealth } from "./renderCreatureHealth.js";
import { renderFireball } from "./renderFireball.js";

import {
  outerMapCollision,
  updatePosition,
  isCreature,
} from "@creatures/shared/gameLogicUtilities";
import { activePlayer } from "./activePlayerCreature.js";

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

const renderEntity = (entity: Entity, currentTime: number) => {
  switch (entity.type) {
    case "creature":
      renderCreature(entity, currentTime);
      renderCreatureHealth(entity);
      break;
    default:
      renderFireball(entity, currentTime);
  }
};

export const render = (state: State, currentTime: number) => {
  ctx.fillStyle = "lightskyblue";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  renderBackground(state.map);
  const creatureGhosts = state.entities
    .filter(isCreature)
    .filter((creature) => creature.player === activePlayer)
    .filter((creature) => creature.nextActions.length !== 0)
    .map(getGhost);
  for (let x = 0; x < countColumns; x++) {
    for (let y = 0; y < countRow; y++) {
      const entities = state.entities.filter(
        (entity) => entity.position.x === x && entity.position.y === y,
      );
      entities.forEach((entity) => renderEntity(entity, currentTime));
      ctx.globalAlpha = 0.5;
      creatureGhosts
        .filter((ghost) => ghost.position.x === x && ghost.position.y === y)
        .forEach((creature) => renderCreature(creature, currentTime));
      ctx.globalAlpha = 1;
    }
  }
  renderUi(state);
};

export const getGhost = (creature: Creature) => {
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
