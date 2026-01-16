import type {
  Action,
  Creature,
  Position,
  State,
} from "@creatures/shared/state";
import { canvas, ctx } from "./render.js";
import { activePlayer } from "./activePlayerCreature.js";

export const renderUI = (state: State) =>
  state.creatures
    .filter((creature) => creature.player === activePlayer)
    .forEach((creature, columnIndex) =>
      renderActionList(creature, columnIndex),
    );

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
