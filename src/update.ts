import type { Creature, State, Action } from "./state.js";

const updatePosition = (creature: Creature, nextAction: Action) => {
  switch (nextAction.direction) {
    case "up":
      return {
        ...creature,
        nextAction: null,
        position: { ...creature.position, y: creature.position.y - 1 },
        ongoingAction: null,
      };
    case "left":
      return {
        ...creature,
        nextAction: null,
        position: { ...creature.position, x: creature.position.x - 1 },
        ongoingAction: null,
      };
    case "right":
      return {
        ...creature,
        nextAction: null,
        position: { ...creature.position, x: creature.position.x + 1 },
        ongoingAction: null,
      };
    case "down":
      return {
        ...creature,
        nextAction: null,
        position: { ...creature.position, y: creature.position.y + 1 },
        ongoingAction: null,
      };
  }
};

const updateActions = (creature: Creature) => {
  if (creature.ongoingAction) return creature;
  const nextAction = creature.nextActions[0];
  if (!nextAction) return creature;
  creature = {
    ...creature,
    ongoingAction: { ...nextAction },
    nextActions: creature.nextActions.slice(1),
  };
  if (nextAction.type === "move") return updatePosition(creature, nextAction);
  else return creature;
};

export function update(state: State, deltaTime: number): State {
  const updatedCreatures = state.creatures.map(updateActions);

  return { ...state, creatures: updatedCreatures };
}
