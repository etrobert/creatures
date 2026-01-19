// TODO: Use the same code to render all the animations

import type { Entity } from "@creatures/shared/state";
import { cellWidth, ctx, gridToCanvas } from "./render.js";

const imgWidth = 32;
const imgHeight = 32;
const animationFrames = 2;
const frameDuration = 400;

const imgFireball1 = new Image();
imgFireball1.src = "/sprites/animations/Fireball/FireBall1.png";

const imgFireball2 = new Image();
imgFireball2.src = "/sprites/animations/Fireball/FireBall2.png";

export const renderFireball = (projectile: Entity, currentTime: number) => {
  const canvasPosition = gridToCanvas(projectile.position);

  const img =
    Math.floor(currentTime / frameDuration) % animationFrames === 0
      ? imgFireball1
      : imgFireball2;
  ctx.drawImage(
    img,
    0,
    0,
    imgWidth,
    imgHeight,
    canvasPosition.x - (imgWidth - cellWidth) / 2,
    canvasPosition.y - (imgWidth - cellWidth) / 2,
    imgWidth,
    imgHeight,
  );
};
