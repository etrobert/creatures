// TODO: Use the same code to render all the animations

import type { Entity } from "@creatures/shared/state";
import { cellWidth, ctx, gridToCanvas } from "./render.js";

const imgWidth = 32;
const imgHeight = 32;

const imgRock = new Image();
imgRock.src = "/sprites/background/Mushrooms, Flowers, Stones.png";

export const renderRock = (rock: Entity) => {
  const canvasPosition = gridToCanvas(rock.position);

  const img = imgRock;
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
