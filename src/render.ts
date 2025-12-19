import { countColumns, countRow, type Creature, type State } from "./state.js";
import type { Direction, Position } from "./state.js";

const canvas = document.querySelector("canvas");
if (canvas === null) throw new Error("Could not get canvas");

const ctx = canvas.getContext("2d");
if (ctx === null) throw new Error("Could not get ctx");

const cellWidth = 32;
const cellHeight = 32;

canvas.width = cellWidth * countColumns;
canvas.height = cellHeight * countRow;

const positionOnCanvas = ({ x, y }: Position) => ({
  canvasX: x * cellWidth,
  canvasY: y * cellHeight,
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
const frameDuration = 100;
img.src = "./sprites/animations/bulbasaur/Walk-Anim.png";

const renderCreature = (creature: Creature, currentTime: number) => {
  const color = creature.player === 0 ? "blue" : "red";
  const canvasPosition = positionOnCanvas(creature.position);
  ctx.fillStyle = color;
  ctx.fillRect(
    canvasPosition.canvasX,
    canvasPosition.canvasY,
    cellWidth,
    cellHeight,
  );

  ctx.drawImage(
    img,
    (Math.floor(currentTime / frameDuration) % animationFrames) * imgWidth,
    getDirectionLine(creature.direction) * imgHeight,
    imgWidth,
    imgHeight,
    canvasPosition.canvasX - (imgWidth - cellWidth) / 2,
    canvasPosition.canvasY - (imgWidth - cellWidth) / 2,
    imgWidth,
    imgHeight,
  );
};

export const render = (state: State, currentTime: number) => {
  ctx.fillStyle = "grey";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  state.creatures.forEach((creature) => renderCreature(creature, currentTime));
};
