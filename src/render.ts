import type { State } from "./state.js";

const canvas = document.querySelector("canvas");
if (canvas === null) throw new Error("Could not get canvas");

const ctx = canvas.getContext("2d");
if (ctx === null) throw new Error("Could not get ctx");

export const render = (state: State) => {
  ctx.fillStyle = "grey";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const { position } of state.creatures) {
    ctx.fillStyle = "blue";
    ctx.fillRect(position.x, position.y, 100, 100);
  }
};
