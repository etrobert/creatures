// TODO: Use the same code to render all the animations

import type { Direction, Entity } from "@creatures/shared/state";
import { cellWidth, ctx, gridToCanvas } from "./render.js";

const imgWidth = 32;
const imgHeight = 32;
const animationFrames = 2;
const frameDuration = 400;

const imgFireball1 = new Image();
imgFireball1.src = "/sprites/animations/Fireball/FireBall1.png";

const imgFireball2 = new Image();
imgFireball2.src = "/sprites/animations/Fireball/FireBall2.png";

const getRotation = (direction: Direction) => {
  switch (direction) {
    case "left":
      return 0;
    case "up":
      return Math.PI / 2;
    case "down":
      return -Math.PI / 2;
    case "right":
      return Math.PI;
  }
};

export const renderFireball = (projectile: Entity, currentTime: number) => {
  const canvasPosition = gridToCanvas(projectile.position);

  const img =
    Math.floor(currentTime / frameDuration) % animationFrames === 0
      ? imgFireball1
      : imgFireball2;
  const drawX = canvasPosition.x - (imgWidth - cellWidth) / 2;
  const drawY = canvasPosition.y - (imgWidth - cellWidth) / 2;
  const centerX = drawX + imgWidth / 2;
  const centerY = drawY + imgHeight / 2;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(getRotation(projectile.direction));
  ctx.drawImage(
    img,
    0,
    0,
    imgWidth,
    imgHeight,
    -imgWidth / 2,
    -imgHeight / 2,
    imgWidth,
    imgHeight,
  );
  ctx.restore();
};
