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
  const color = creature.player === activePlayer ? "blue" : "red";
  const canvasPosition = gridToCanvas(creature.position);
  ctx.fillStyle = color;
  ctx.fillRect(canvasPosition.x, canvasPosition.y, cellWidth, cellHeight);
  const animatedCreature = animationList[creature.name];
  if (animatedCreature === undefined)
    throw new Error("Does not find sprite for the creature");
  ctx.drawImage(
    animatedCreature.img,
    (Math.floor(
      (currentTime / tickDuration) * animatedCreature.animationFrames,
    ) %
      animatedCreature.animationFrames) *
      animatedCreature.imgWidth,
    getDirectionLine(creature.direction) * animatedCreature.imgHeight,
    animatedCreature.imgWidth,
    animatedCreature.imgHeight,
    canvasPosition.x - (animatedCreature.imgWidth - cellWidth) / 2,
    canvasPosition.y - (animatedCreature.imgWidth - cellWidth) / 2,
    animatedCreature.imgWidth,
    animatedCreature.imgHeight,
  );
};

const imgBulbizard = new Image();
imgBulbizard.src = "/sprites/animations/bulbasaur/Walk-Anim.png";
const animationBulbizard = {
  name: "bulbizard",
  img: imgBulbizard,
  imgWidth: 40,
  imgHeight: 40,
  animationFrames: 6,
};

const imgSalameche = new Image();
imgSalameche.src = "/sprites/animations/salameche/Walk-Anim.png";
const animationSalameche = {
  name: "salameche",
  img: imgSalameche,
  imgWidth: 32,
  imgHeight: 32,
  animationFrames: 4,
};

const animationList = {
  bulbizard: animationBulbizard,
  salameche: animationSalameche,
};
