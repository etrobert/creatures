import { setState, state } from "./state.js";
import { canvas, cellWidth, cellHeight } from "./render.js";
import type { Position } from "./state.js";

export const setupEventListeners = () => {
  window.addEventListener("keydown", (event) => {
    const getDirection = () => {
      switch (event.code) {
        case "KeyW":
          return "up";
        case "KeyA":
          return "left";
        case "KeyS":
          return "down";
        case "KeyD":
          return "right";
      }
    };

    const direction = getDirection();

    if (direction === undefined) return;

    setState({
      ...state,
      creatures: state.creatures.map((creature) =>
        creature.player === 0
          ? {
              ...creature,
              nextActions: [
                ...creature.nextActions,
                { type: "move", direction } as const,
              ],
            }
          : creature,
      ),
    });
  });

  if (canvas)
    canvas.addEventListener("click", (event) => {
      const { x, y } = canvasOnPosition({ x: event.offsetX, y: event.offsetY });
      console.log(x);
      console.log(y);
    });
};

// translation bwtween grid position and canvas position
const canvasOnPosition = ({ x, y }: Position) => ({
  x: Math.floor(x / cellWidth),
  y: Math.floor(y / cellHeight),
});
