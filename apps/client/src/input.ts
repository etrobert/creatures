import { canvas, cellWidth, cellHeight, getGhost } from "./render.js";
import {
  activeCreatureId,
  activePlayer,
  listPlayerCreaturesId,
  setActiveCreatureId,
} from "./activePlayerCreature.js";
import type { Position } from "@creatures/shared/state";
import { state } from "./state.js";
import { sendClientMessage, ws } from "./socket.js";

export const setupEventListeners = () => {
  window.addEventListener("keydown", (event) => {
    const activeCreature = state.creatures.find(
      ({ id }) => id === activeCreatureId,
    );
    if (activeCreature === undefined)
      throw new Error("Couldn't find active creature");

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
          return {
            type: "attack",
            direction: activeCreature.direction,
          } as const;
        }
      }
    };

    const newAction = getAction();

    if (newAction === undefined) return;

    sendClientMessage({
      type: "player input",
      creatureId: activeCreature.id,
      actions: [newAction],
    });
  });

  canvas.addEventListener("click", (event) => {
    const { x, y } = canvasToGrid({ x: event.offsetX, y: event.offsetY });
    const activeCreature = state.creatures.find(
      (creature) =>
        creature.player === activePlayer && creature.id === activeCreatureId,
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
    sendClientMessage({
      type: "player input",
      creatureId: activeCreature.id,
      actions: [...nextActionsX, ...nextActionsY],
    });
  });

  window.addEventListener("keydown", (event) => {
    const getActiveCreature = () => {
      const listActivePlayerCreaturesId = listPlayerCreaturesId(activePlayer);
      switch (event.code) {
        case "Digit1":
          return listActivePlayerCreaturesId[0];
        case "Digit2":
          return listActivePlayerCreaturesId[1];
        case "Digit3":
          return listActivePlayerCreaturesId[2];
        case "Digit4":
          return listActivePlayerCreaturesId[3];
      }
    };

    const newActiveCreature = getActiveCreature();
    if (newActiveCreature === undefined) return;
    setActiveCreatureId(newActiveCreature);
  });
};

// translation bwtween grid position and canvas position
const canvasToGrid = ({ x, y }: Position) => ({
  x: Math.floor((x - cellWidth / 2) / cellWidth),
  y: Math.floor((y - cellHeight / 2) / cellHeight),
});
