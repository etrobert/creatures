import { countColumns, countRow, type Creature, type State } from "./state.js";
import type { Position } from "./state.js";

const canvas = document.querySelector("canvas");
if (canvas === null) throw new Error("Could not get canvas");

const ctx = canvas.getContext("2d");
if (ctx === null) throw new Error("Could not get ctx");

const cellWidth = 40;
const cellHeight = 40;

canvas.width = cellWidth * countColumns;
canvas.height = cellHeight * countRow;

const positionOnCanvas = ({ x, y }: Position) => ({
  canvasX: x * cellWidth,
  canvasY: y * cellHeight,
});

const renderCreature = (creature: Creature) => {
  const color = creature.player === 0 ? "blue" : "red";
  const canvasPosition = positionOnCanvas(creature.position);
  ctx.fillStyle = color;
  ctx.fillRect(
    canvasPosition.canvasX,
    canvasPosition.canvasY,
    cellWidth,
    cellHeight,
  );

  const img = new Image();
  const imgWidth = 40;
  const imgHeigth = 40;
  img.src = "./sprites/animations/bulbasaur/Walk-Anim.png";

  ctx.drawImage(
    img,
    0,
    0,
    imgWidth,
    imgHeigth,
    canvasPosition.canvasX,
    canvasPosition.canvasY,
    imgWidth,
    imgHeigth,
  );
};

export const render = (state: State) => {
  ctx.fillStyle = "grey";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  state.creatures.forEach((creature) => renderCreature(creature));
};
