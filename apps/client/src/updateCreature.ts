import {
  type Creature,
  type State,
  type Position,
  type Action,
  type Direction,
  countColumns,
  countRow,
  type MoveAction,
  type AttackAction,
} from "./state.js";

export const updateCreature = (state: State, creature: Creature): State => {
  creature = updateActions(creature);
  return applyOngoingAction(state, creature);
};

const updateActions = (creature: Creature) => {
  if (creature.ongoingAction) return creature;
  const [ongoingAction, ...nextActions] = creature.nextActions;
  if (!ongoingAction) return creature;
  return { ...creature, ongoingAction, nextActions };
};

const applyMove = (
  state: State,
  creature: Creature,
  moveAction: MoveAction,
): State => {
  const collision = (newPosition: Position) => {
    const creatureAtPosition = getCreatureAtPosition(state, newPosition);
    return collisionWithMap(newPosition) || creatureAtPosition !== undefined;
  };
  return {
    ...state,
    creatures: state.creatures.map((mappedCreature) =>
      mappedCreature.id === creature.id
        ? updatePosition(creature, moveAction, collision)
        : mappedCreature,
    ),
  };
};

const applyAttack = (
  state: State,
  creature: Creature,
  attackAction: AttackAction,
) => {
  console.log(creature.health);
  const tileAttacked = getNewPosition(
    creature.position,
    attackAction.direction,
  );
  const attackedCreature = getCreatureAtPosition(state, tileAttacked);
  //   Once Serveur is document, we need to update de attacked creature (not the attacking).
  // To do SourceBuffer, this function needs to return the state
  return {
    ...creature,
    health: creature.health - 1,
    ongoingAction: null,
  };
};

const applyOngoingAction = (state: State, creature: Creature): State => {
  switch (creature.ongoingAction?.type) {
    case "move":
      return applyMove(state, creature, creature.ongoingAction);
    // case "attack":
    // return applyAttack(state, creature, creature.ongoingAction);
    default:
      return state;
  }
};

export const updatePosition = (
  creature: Creature,
  nextAction: Action,
  collision: (newPosition: Position) => boolean,
): Creature => {
  const newPosition = getNewPosition(creature.position, nextAction.direction);

  if (collision(newPosition)) return { ...creature, ongoingAction: null };

  return {
    ...creature,
    position: newPosition,
    direction: nextAction.direction,
    ongoingAction: null,
  };
};

export const getCreatureAtPosition = (state: State, position: Position) =>
  state.creatures.find(
    (creature) =>
      creature.position.x === position.x && creature.position.y === position.y,
  );

export const collisionWithMap = (newPosition: Position) =>
  newPosition.x < 0 ||
  newPosition.x >= countColumns ||
  newPosition.y < 0 ||
  newPosition.y >= countRow;

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
