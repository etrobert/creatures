import type { State } from "./state.js";

const canvas = document.querySelector("canvas");
if (canvas === null) throw new Error("Could not get canvas");

const ctx = canvas.getContext("2d");
if (ctx === null) throw new Error("Could not get ctx");

export const render = (state: State) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const { position } = state;
  ctx.fillStyle = "green";
  // Add a rectangle at (10, 10) with size 100x100 pixels
  ctx.fillRect(position.x, position.y, 100, 100);
};
