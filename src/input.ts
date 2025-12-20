import { setState, state } from "./state.js";

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

  window.addEventListener("click", (event) => {
    console.log(event.x);
    console.log(event.y);
  });
};
