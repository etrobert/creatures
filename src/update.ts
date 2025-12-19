import type { Creature, State, Action } from "./state.js";

const updatePosition = (creature: Creature, nextAction: Action) => {
  switch (nextAction.direction) {
    case "up":
      return {
        ...creature,
        position: { ...creature.position, y: creature.position.y - 1 },
        ongoingAction: null,
      };
    case "left":
      return {
        ...creature,
        position: { ...creature.position, x: creature.position.x - 1 },
        ongoingAction: null,
      };
    case "right":
      return {
        ...creature,
        position: { ...creature.position, x: creature.position.x + 1 },
        ongoingAction: null,
      };
    case "down":
      return {
        ...creature,
        position: { ...creature.position, y: creature.position.y + 1 },
        ongoingAction: null,
      };
  }
};

const updateActions = (creature: Creature) => {
  if (creature.ongoingAction) return creature;
  const [ongoingAction, ...nextActions] = creature.nextActions;
  if (!ongoingAction) return creature;
  return { ...creature, ongoingAction, nextActions };
};

const applyOngoingAction = (creature: Creature) => {
  switch (creature.ongoingAction?.type) {
    case "move":
      return updatePosition(creature, creature.ongoingAction);
    default:
      return creature;
  }
};

const updateCreature = (creature: Creature) => {
  creature = updateActions(creature);
  return applyOngoingAction(creature);
};

const tickDuration = 300;

export function update(state: State, currentTime: number): State {
  if (currentTime - state.lastTick < tickDuration) return state;

  const lastTick = currentTime;

  const creatures = state.creatures.map(updateCreature);

  return { lastTick, creatures };
}
