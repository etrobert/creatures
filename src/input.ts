import { setState, state } from "./state.js";
import { canvas, cellWidth, cellHeight } from "./render.js";
import type { Creature, Position } from "./state.js";

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
      if (x === undefined) return;
      const activeCreature = state.creatures.find((creature) =>
        findActiveCreature(creature, 0),
      );
      // add ghost calculation when in
      if (activeCreature === undefined) return;
      const nextActionsX =
        activeCreature?.position.x < x
          ? new Array(x - activeCreature?.position.x).fill({
              type: "move",
              direction: "right",
            })
          : new Array(activeCreature?.position.x - x).fill({
              type: "move",
              direction: "left",
            });
      const nextActionsY =
        activeCreature?.position.y < y
          ? new Array(y - activeCreature?.position.y).fill({
              type: "move",
              direction: "down",
            })
          : new Array(activeCreature?.position.y - y).fill({
              type: "move",
              direction: "up",
            });
      const nextActions = [...nextActionsX, ...nextActionsY];
      setState({
        ...state,
        creatures: state.creatures.map((creature) =>
          creature.player === 0 && creature.selected
            ? {
                ...creature,
                nextActions: [
                  // ...creature.nextActions, to be added when ghost is there
                  ...nextActions,
                ],
              }
            : creature,
        ),
      });
    });
};

const findActiveCreature = (creature: Creature, player: number) => {
  return creature.player === player;
};

// translation bwtween grid position and canvas position
const canvasOnPosition = ({ x, y }: Position) => ({
  x: Math.floor(x / cellWidth),
  y: Math.floor(y / cellHeight),
});
