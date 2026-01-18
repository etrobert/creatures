import type {
  Action,
  Creature,
  Position,
  State,
} from "@creatures/shared/state";
import { canvas, ctx } from "./render.js";
import { activePlayer } from "./activePlayerCreature.js";
import { isCreature } from "@creatures/shared/gameLogicUtilities";

export const renderUi = (state: State) =>
  state.entities
    .filter(isCreature)
    .filter((creature) => creature.player === activePlayer)
    .forEach((creature, columnIndex) =>
      renderActionList(creature, columnIndex),
    );

const actionSquareWidth = 10;
const padding = 2;

export const renderActionList = (creature: Creature, columnIndex: number) => {
  const topLeftCorner: Position = {
    x:
      canvas.width -
      actionSquareWidth -
      padding -
      columnIndex * (actionSquareWidth + padding),
    y: padding,
  };

  creature.nextActions.forEach((action, i) =>
    renderActionElement(action, {
      x: topLeftCorner.x,
      y: topLeftCorner.y + i * (actionSquareWidth + padding),
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
