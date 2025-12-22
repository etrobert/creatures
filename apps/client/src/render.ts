import { countColumns, countRow, type Creature, type State } from "./state.js";
import type { Position } from "./state.js";
import { collisionWithMap } from "./updateCreature.js";
import { renderBackground, backgroundMap } from "./background.js";
import { renderCreature } from "./renderCreature.js";
import { updatePosition } from "./updateCreature.js";

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
};

const renderCreatureHealth = (creature: Creature) => {
  const canvasPosition = gridToCanvas(creature.position);
  const xPad = cellWidth / 8;
  const yPadTop = (-1 * cellHeight) / 16;
  const yPadBot = (cellHeight * 15) / 16;
  ctx.fillStyle = "black";

  ctx.fillRect(
    canvasPosition.x + xPad - 1,
    canvasPosition.y + yPadTop - 1,
    cellWidth - 2 * xPad + 2,
    cellHeight - (yPadTop + yPadBot) + 2,
  );
  ctx.fillStyle = "LightGray";

  ctx.fillRect(
    canvasPosition.x + xPad,
    canvasPosition.y + yPadTop,
    cellWidth - 2 * xPad,
    cellHeight - (yPadTop + yPadBot),
  );

  const percentageHealth = creature.health / creature.maxHealth;
  ctx.fillStyle = "green";
  const endCurrentHP = percentageHealth * (cellWidth - 2 * xPad);

  ctx.fillRect(
    canvasPosition.x + xPad,
    canvasPosition.y + yPadTop,
    endCurrentHP,
    cellHeight - (yPadTop + yPadBot),
  );
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
