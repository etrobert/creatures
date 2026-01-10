import { setState, state } from "./state.js";
import { canvas, cellWidth, cellHeight, getGhost } from "./render.js";
import type { Creature, Position } from "./state.js";
import { activePlayer } from "./index.js";

export const setupEventListeners = () => {
  window.addEventListener("keydown", (event) => {
    const getAction = () => {
      switch (event.code) {
        case "KeyW":
          return { type: "move", direction: "up" } as const;
        case "KeyA":
          return { type: "move", direction: "left" } as const;
        case "KeyS":
          return { type: "move", direction: "down" } as const;
        case "KeyD":
          return { type: "move", direction: "right" } as const;
        case "KeyQ": {
          const activeCreature = findActiveCreature(0);
          if (activeCreature === undefined)
            throw new Error("Couldn't find active creature");
          return {
            type: "attack",
            direction: activeCreature.direction,
          } as const;
        }
      }
    };

    const newAction = getAction();

    if (newAction === undefined) return;

    setState({
      ...state,
      creatures: state.creatures.map((creature) =>
        creature.player === activePlayer
          ? {
              ...creature,
              nextActions: [...creature.nextActions, newAction],
            }
          : creature,
      ),
    });
  });

  canvas.addEventListener("click", (event) => {
    const { x, y } = canvasToGrid({ x: event.offsetX, y: event.offsetY });
    const activeCreature = findActiveCreature(activePlayer);
    // add ghost calculation when in
    if (activeCreature === undefined) return;
    const ghost = getGhost(activeCreature);
    const nextActionsX =
      ghost.position.x < x
        ? new Array(x - ghost.position.x).fill({
            type: "move",
            direction: "right",
          })
        : new Array(ghost.position.x - x).fill({
            type: "move",
            direction: "left",
          });
    const nextActionsY =
      ghost.position.y < y
        ? new Array(y - ghost.position.y).fill({
            type: "move",
            direction: "down",
          })
        : new Array(ghost.position.y - y).fill({
            type: "move",
            direction: "up",
          });
    const nextActions = [...nextActionsX, ...nextActionsY];
    setState({
      ...state,
      creatures: state.creatures.map((creature) =>
        creature.player === activePlayer
          ? {
              ...creature,
              nextActions: [...creature.nextActions, ...nextActions],
            }
          : creature,
      ),
    });
  });
};

const findActiveCreature = (player: number) =>
  state.creatures.find((creature) => creature.player === player);

// translation bwtween grid position and canvas position
const canvasToGrid = ({ x, y }: Position) => ({
  x: Math.floor((x - cellWidth / 2) / cellWidth),
  y: Math.floor((y - cellHeight / 2) / cellHeight),
});
