import {
  type Creature,
  type State,
  type Action,
  type Position,
  type Direction,
  countColumns,
  countRow,
} from "./state.js";

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

const updatePosition = (
  state: State,
  creature: Creature,
  nextAction: Action,
): Creature => {
  const newPosition = getNewPosition(creature.position, nextAction.direction);

  const creatureAtPosition = getCreatureAtPosition(state, newPosition);

  if (
    newPosition.x < 0 ||
    newPosition.x >= countColumns ||
    newPosition.y < 0 ||
    newPosition.y >= countRow ||
    creatureAtPosition
  )
    return { ...creature, ongoingAction: null };

  return {
    ...creature,
    position: newPosition,
    direction: nextAction.direction,
    ongoingAction: null,
  };
};

const updateActions = (creature: Creature) => {
  if (creature.ongoingAction) return creature;
  const [ongoingAction, ...nextActions] = creature.nextActions;
  if (!ongoingAction) return creature;
  return { ...creature, ongoingAction, nextActions };
};

const applyOngoingAction = (state: State, creature: Creature) => {
  switch (creature.ongoingAction?.type) {
    case "move":
      return updatePosition(state, creature, creature.ongoingAction);
    default:
      return creature;
  }
};

const updateCreature = (state: State, creature: Creature) => {
  creature = updateActions(creature);
  return applyOngoingAction(state, creature);
};

const tickDuration = 300;

export function update(state: State, currentTime: number): State {
  if (currentTime - state.lastTick < tickDuration) return state;

  const lastTick = currentTime;

  const creatures = state.creatures.map((creature) =>
    updateCreature(state, creature),
  );

  return { lastTick, creatures };
}
