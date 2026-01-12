import type {
  Action,
  Creature,
  Position,
  State,
} from "@creatures/shared/state";
import { canvas, cellHeight, cellWidth, ctx, gridToCanvas } from "./render.js";
import { activePlayer } from "./activePlayerCreature.js";

export const renderUI = (state: State) => {
  const creatures = state.creatures.filter(
    (creature) => creature.player === activePlayer,
  );
  creatures.forEach((creature, columnIndex) =>
    renderActionList(creature, columnIndex),
  );
};

export const renderCreatureHealth = (creature: Creature) => {
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

const actionSquareWidth = 10;
const paddingWidth = 2;

export const renderActionList = (creature: Creature, columnIndex: number) => {
  const topLeftCorner: Position = {
    x:
      canvas.width -
      actionSquareWidth -
      paddingWidth -
      columnIndex * (actionSquareWidth + paddingWidth),
    y: paddingWidth,
  };

  creature.nextActions.forEach((action, i) =>
    renderActionElement(action, {
      x: topLeftCorner.x,
      y: topLeftCorner.y + i * (actionSquareWidth + paddingWidth),
    }),
  );
};

const renderActionElement = (action: Action, topLeftCorner: Position) => {
  ctx.fillStyle = "white";
  ctx.fillRect(
    topLeftCorner.x,
    topLeftCorner.y,
    actionSquareWidth,
    actionSquareWidth,
  );
};
