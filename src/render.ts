import type { State } from "./state.js";
import type { Position } from "./state.js";

const canvas = document.querySelector("canvas");
if (canvas === null) throw new Error("Could not get canvas");

const ctx = canvas.getContext("2d");
if (ctx === null) throw new Error("Could not get ctx");

const countColumns = 10;
const countRow = 7;
const cellWidth = canvas.width / countColumns;
const cellHeight = canvas.height / countRow;

const positionOnCanvas = ({ x, y }: Position) => ({
  canvasX: x * cellWidth,
  canvasY: y * cellHeight,
});

export const render = (state: State) => {
  ctx.fillStyle = "grey";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const { position, player } of state.creatures) {
    const color = player === 0 ? "blue" : "red";
    const canvasPosition = positionOnCanvas(position);
    ctx.fillStyle = color;
    ctx.fillRect(
      canvasPosition.canvasX,
      canvasPosition.canvasY,
      cellWidth,
      cellHeight
    );
  }
};
