import type { Creature } from "@creatures/shared/state";
import { cellHeight, cellWidth, ctx, gridToCanvas } from "./render.js";
import { activeCreatureId, activePlayer } from "./activePlayerCreature.js";

const getHealthAspect = (creature: Creature) => {
  const enemyAspect = { color: "#E72D23", size: "medium" };
  const activeCreatureAspect = { color: "#006264", size: "big" };
  const allyAspect = { color: "#0079BA", size: "small" };
  if (creature.player !== activePlayer) return enemyAspect;
  if (creature.id === activeCreatureId) return activeCreatureAspect;
  return allyAspect;
};

export const renderCreatureHealth = (creature: Creature) => {
  const aspect = getHealthAspect(creature);
  renderCreatureHealthWithColor(creature, aspect);
};

const getHealthSizeParams = (size: string) => {
  switch (size) {
    case "big":
      return { ySize: 7, yPad: 4, xMargin: 0 };
    case "medium":
      return { ySize: 6, yPad: 3, xMargin: 1 };
    case "small":
      return { ySize: 5, yPad: 3, xMargin: 2 };
    default:
      return { ySize: 5, yPad: 3, xMargin: 2 };
  }
};

const renderCreatureHealthWithColor = (
  creature: Creature,
  aspect: { color: string; size: string },
) => {
  const canvasPosition = gridToCanvas(creature.position);
  const { ySize, yPad, xMargin } = getHealthSizeParams(aspect.size);
  const greyRectangleTop = {
    x: canvasPosition.x + 1 + xMargin,
    y: canvasPosition.y - yPad + 1,
  };
  const greyRectangleSize = { x: cellHeight - 2 - xMargin * 2, y: ySize - 2 };
  ctx.fillStyle = "black";

  ctx.fillRect(
    greyRectangleTop.x - 1,
    greyRectangleTop.y - 1,
    greyRectangleSize.x + 2,
    greyRectangleSize.y + 2,
  );
  ctx.fillStyle = "LightGray";

  ctx.fillRect(
    greyRectangleTop.x,
    greyRectangleTop.y,
    greyRectangleSize.x,
    greyRectangleSize.y,
  );

  const percentageHealth = creature.health / creature.maxHealth;
  ctx.fillStyle = aspect.color;
  const endCurrentHP = percentageHealth * greyRectangleSize.x;

  ctx.fillRect(
    greyRectangleTop.x,
    greyRectangleTop.y,
    endCurrentHP,
    greyRectangleSize.y,
  );
};
