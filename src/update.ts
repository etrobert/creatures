import type { Creature, State } from "./state.js";

const updatePosition = (creature: Creature) => {
  if (creature.nextAction === null) return creature;

  switch (creature.nextAction.direction) {
    case "up":
      return {
        ...creature,
        position: { ...creature.position, y: creature.position.y - 1 },
      };
    case "left":
      return {
        ...creature,
        position: { ...creature.position, x: creature.position.x - 1 },
      };
    case "right":
      return {
        ...creature,
        position: { ...creature.position, x: creature.position.x + 1 },
      };
    case "down":
      return {
        ...creature,
        position: { ...creature.position, y: creature.position.y + 1 },
      };
  }
};

export function update(state: State, deltaTime: number): State {
  const updatedCreatures = state.creatures.map(updatePosition);

  return { ...state, creatures: updatedCreatures };
}
