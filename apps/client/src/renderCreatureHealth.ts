import type { Creature } from "@creatures/shared/state";
import { cellHeight, cellWidth, ctx, gridToCanvas } from "./render.js";
import { activeCreatureId, activePlayer } from "./activePlayerCreature.js";

export const renderCreatureHealth = (creature: Creature) => {
  creature.player !== activePlayer
    ? renderCreatureHealthWithColor(creature, "#EF3E4D")
    : creature.id === activeCreatureId
      ? renderCreatureHealthWithColor(creature, "#40A060")
      : renderCreatureHealthWithColor(creature, "#50C878");
};

const renderCreatureHealthWithColor = (creature: Creature, color: string) => {
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
  ctx.fillStyle = color;
  const endCurrentHP = percentageHealth * (cellWidth - 2 * xPad);

  ctx.fillRect(
    canvasPosition.x + xPad,
    canvasPosition.y + yPadTop,
    endCurrentHP,
    cellHeight - (yPadTop + yPadBot),
  );
};
