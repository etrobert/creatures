import { countColumns, countRow, type Creature, type State } from "./state.js";
import type { Direction, Position } from "./state.js";
import { tickDuration, updatePosition, collisionWithMap } from "./update.js";
import { renderBackground, backgroundMap } from "./background.js";
import { renderCreature } from "./renderCreature.js";

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
        creatures.forEach((creature) => renderCreature(creature, currentTime));

      const creatureGhosts = state.creatures
        .filter((creature) => creature.nextActions.length !== 0)
        .map(getGhost)
        .filter(
          ({ ghost, countRemainingTicks }) =>
            ghost.position.x === x && ghost.position.y === y,
        );
      creatureGhosts.forEach(({ ghost, countRemainingTicks }) => {
        ctx.globalAlpha = 0.5;
        renderCreature(ghost, currentTime);
        ctx.globalAlpha = 1;
        renderCountRemainingTicks(ghost, countRemainingTicks);
      });
    }
  }
};

export const getGhost = (creature: Creature) => {
  let ghost = creature;
  let i = 0;
  while (ghost.nextActions[0]) {
    i = i + 1;
    const [nextAction, ...nextActions] = ghost.nextActions;
    ghost = { ...ghost, nextActions };
    ghost = updatePosition(ghost, nextAction, collisionWithMap);
  }
  return { ghost, countRemainingTicks: i };
};

const renderCountRemainingTicks = (
  creature: Creature,
  countRemainingTicks: number,
) => {
  const canvasPosition = gridToCanvas(creature.position);
  ctx.fillStyle = "white";
  const size = 8;
  ctx.fillRect(
    canvasPosition.x + cellWidth - size - 2,
    canvasPosition.y + cellWidth - size - 2,
    size,
    size,
  );
  creature.nextActions.length;
  ctx.strokeText(
    String(countRemainingTicks),
    canvasPosition.x + cellWidth - size - 2,
    canvasPosition.y + cellWidth - 2,
  );
};
