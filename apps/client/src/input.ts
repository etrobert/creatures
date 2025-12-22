import { setState, state } from "./state.js";
import { canvas, cellWidth, cellHeight, getGhost } from "./render.js";
import type { Action, Creature, Position } from "./state.js";
import { activePlayer } from "./index.js";

export const setupEventListeners = () => {
  window.addEventListener("keydown", (event) => {
    const getDirection = () => {
      switch (event.code) {
        case "KeyW":
          return { type: "move", direction: "up" } as Action;
        case "KeyA":
          return { type: "move", direction: "left" } as Action;
        case "KeyS":
          return { type: "move", direction: "down" } as Action;
        case "KeyD":
          return { type: "move", direction: "right" } as Action;
        case "KeyQ":
          return { type: "attack", direction: "up" } as Action;
      }
    };

    const newAction = getDirection();

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
    const activeCreature = state.creatures.find((creature) =>
      findActiveCreature(creature, activePlayer),
    );
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

const findActiveCreature = (creature: Creature, player: number) => {
  return creature.player === player;
};

// translation bwtween grid position and canvas position
const canvasToGrid = ({ x, y }: Position) => ({
  x: Math.floor((x - cellWidth / 2) / cellWidth),
  y: Math.floor((y - cellHeight / 2) / cellHeight),
});
