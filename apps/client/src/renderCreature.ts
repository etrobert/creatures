import { activePlayer } from "./activePlayerCreature.js";
import { ctx } from "./render.js";
import { cellHeight, cellWidth, gridToCanvas } from "./render.js";
import {
  tickDuration,
  type Creature,
  type Direction,
} from "@creatures/shared/state";

const getDirectionLine = (direction: Direction) => {
  switch (direction) {
    case "down":
      return 0;
    case "right":
      return 2;
    case "left":
      return 6;
    case "up":
      return 4;
  }
};

const img = new Image();
const imgWidth = 40;
const imgHeight = 40;
const animationFrames = 6;
const frameDuration = tickDuration / animationFrames;
img.src = "/sprites/animations/bulbasaur/Walk-Anim.png";

export const renderCreature = (creature: Creature, currentTime: number) => {
  const color = creature.player === activePlayer ? "blue" : "red";
  const canvasPosition = gridToCanvas(creature.position);
  ctx.fillStyle = color;
  ctx.fillRect(canvasPosition.x, canvasPosition.y, cellWidth, cellHeight);

  ctx.drawImage(
    img,
    (Math.floor(currentTime / frameDuration) % animationFrames) * imgWidth,
    getDirectionLine(creature.direction) * imgHeight,
    imgWidth,
    imgHeight,
    canvasPosition.x - (imgWidth - cellWidth) / 2,
    canvasPosition.y - (imgWidth - cellWidth) / 2,
    imgWidth,
    imgHeight,
  );
};
