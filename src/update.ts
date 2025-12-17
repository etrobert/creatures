import type { Creature, State } from "./state.js";

const updatePosition = (creature: Creature): Creature => {
  if (creature.nextAction === null) return creature;

  switch (creature.nextAction.direction) {
    case "up":
      return {
        ...creature,
        nextAction: null,
        position: { ...creature.position, y: creature.position.y - 1 },
      };
    case "left":
      return {
        ...creature,
        nextAction: null,
        position: { ...creature.position, x: creature.position.x - 1 },
      };
    case "right":
      return {
        ...creature,
        nextAction: null,
        position: { ...creature.position, x: creature.position.x + 1 },
      };
    case "down":
      return {
        ...creature,
        nextAction: null,
        position: { ...creature.position, y: creature.position.y + 1 },
      };
  }
};

export function update(state: State, deltaTime: number): State {
  const updatedCreatures = state.creatures.map(updatePosition);

  return { ...state, creatures: updatedCreatures };
}
