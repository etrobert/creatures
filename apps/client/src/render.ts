import { renderBackground, backgroundMap } from "./background.js";
import { renderCreature } from "./renderCreature.js";
import {
  collisionWithMap,
  updatePosition,
  countColumns,
  countRow,
  type Position,
  type State,
  type Creature,
} from "@creatures/shared/state";
import { renderUi } from "./renderUi.js";
import { renderCreatureHealth } from "./renderCreatureHealth.js";

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

export const render = (state: State, currentTime: number) => {
  ctx.fillStyle = "lightskyblue";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  renderBackground(backgroundMap);
  for (let x = 0; x < countColumns; x++) {
    for (let y = 0; y < countRow; y++) {
      const creatures = state.creatures.filter(
        (creature) => creature.position.x === x && creature.position.y === y,
      );
      if (creatures[0])
        creatures.forEach((creature) => {
          renderCreature(creature, currentTime);
          renderCreatureHealth(creature);
        });
      const creatureGhosts = state.creatures
        .filter((creature) => creature.nextActions.length !== 0)
        .map(getGhost)
        .filter((ghost) => ghost.position.x === x && ghost.position.y === y);
      ctx.globalAlpha = 0.5;
      creatureGhosts.forEach((creature) =>
        renderCreature(creature, currentTime),
      );
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
        collisionWithMap,
      );
  }
  return dummyCreature;
};
