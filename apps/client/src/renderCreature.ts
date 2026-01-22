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

export const renderCreature = (creature: Creature, currentTime: number) => {
  const canvasPosition = gridToCanvas(creature.position);
  // const color = creature.player === activePlayer ? "blue" : "red";
  // ctx.fillStyle = color;
  // ctx.fillRect(canvasPosition.x, canvasPosition.y, cellWidth, cellHeight);
  const animation = entitiesAnimations[creature.name];
  const { animationFrames, imgWidth, imgHeight } = animation;
  const frameDuration = tickDuration / animationFrames;
  ctx.drawImage(
    animation.sprite,
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

const imgBulbizard = new Image();
imgBulbizard.src = "/sprites/animations/bulbasaur/Walk-Anim.png";
const animationBulbizard = {
  name: "bulbizard",
  sprite: imgBulbizard,
  imgWidth: 40,
  imgHeight: 40,
  animationFrames: 6,
};

const imgSalameche = new Image();
imgSalameche.src = "/sprites/animations/salameche/Walk-Anim.png";
const animationSalameche = {
  name: "salameche",
  sprite: imgSalameche,
  imgWidth: 32,
  imgHeight: 32,
  animationFrames: 4,
};

const entitiesAnimations = {
  bulbizard: animationBulbizard,
  salameche: animationSalameche,
};
