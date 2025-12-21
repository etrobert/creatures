import { countColumns, countRow, type Creature, type State } from "./state.js";
import type { Direction, Position } from "./state.js";
import { tickDuration, updatePosition, collisionWithMap } from "./update.js";
import { renderBackground, backgroundMap } from "./background.js";

const canvas = document.querySelector("canvas");
if (canvas === null) throw new Error("Could not get canvas");

export const ctx = canvas.getContext("2d");
if (ctx === null) throw new Error("Could not get ctx");

const cellWidth = 32;
const cellHeight = 32;
canvas.width = cellWidth * (countColumns + 1); //The canvas is 1 cell bigger because a half cell is added at left and right
canvas.height = cellHeight * (countRow + 1);

// translation bwtween grid position and canvas position
const gridToCanvas = ({ x, y }: Position) => ({
  x: x * cellWidth + cellWidth / 2,
  y: y * cellHeight + cellHeight / 2,
});

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
img.src = "./sprites/animations/bulbasaur/Walk-Anim.png";

const renderCreature = (creature: Creature, currentTime: number) => {
  const color = creature.player === 0 ? "blue" : "red";
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

export const render = (state: State, currentTime: number) => {
  ctx.fillStyle = "lightskyblue";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  renderBackground(backgroundMap);
  for (let x = 0; x < countColumns; x++) {
    for (let y = 0; y < countRow; y++) {
      const creatures = state.creatures.filter(
        (creature) => creature.position.x === x && creature.position.y === y,
      );
      if (creatures[0])
        creatures.forEach((creature) => renderCreature(creature, currentTime));

      const creatureGhosts = state.creatures
        .map(getGhost)
        .filter((ghost) => ghost.position.x === x && ghost.position.y === y);
      ctx.globalAlpha = 0.5;
      creatureGhosts.forEach((creature) =>
        renderCreature(creature, currentTime),
      );
      ctx.globalAlpha = 1;
    }
  }
};

const getGhost = (creature: Creature) => {
  let dummyCreature = creature;
  while (dummyCreature.nextActions[0]) {
    const [nextAction, ...nextActions] = dummyCreature.nextActions;
    dummyCreature = { ...dummyCreature, nextActions };
    dummyCreature = updatePosition(dummyCreature, nextAction, collisionWithMap);
  }
  return dummyCreature;
};
