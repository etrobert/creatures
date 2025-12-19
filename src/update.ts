import type { Creature, State, Action, Position, Direction } from "./state.js";

const getCreatureAtPosition = (state: State, position: Position) =>
  state.creatures.find(
    (creature) =>
      creature.position.x === position.x && creature.position.y === position.y,
  );

const getNewPosition = ({ x, y }: Position, direction: Direction) => {
  switch (direction) {
    case "up":
      return { x, y: y - 1 };
    case "down":
      return { x, y: y + 1 };
    case "right":
      return { x: x + 1, y };
    case "left":
      return { x: x - 1, y };
  }
};

const updatePosition = (creature: Creature, nextAction: Action) => {
  const newPosition = getNewPosition(creature.position, nextAction.direction);

  return { ...creature, position: newPosition, ongoingAction: null };
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
