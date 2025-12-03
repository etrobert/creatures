const canvasOr = document.querySelector("canvas");
if (canvasOr === null) throw new Error("Could not get canvas");
const canvas = canvasOr;

const ctxOr = canvas.getContext("2d");
if (ctxOr === null) throw new Error("Could not get ctx");
const ctx = ctxOr;

export function render() {
  // TODO: Implement
  ctx.fillStyle = "green";
  // Add a rectangle at (10, 10) with size 100x100 pixels
  ctx.fillRect(10, 10, 100, 100);
}
