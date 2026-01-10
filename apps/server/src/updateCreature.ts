import {
  collisionWithMap,
  updatePosition,
  getNewPosition,
  type AttackAction,
  type Creature,
  type Position,
  type State,
  type MoveAction,
} from "@creatures/shared/state";

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
        ? {
            ...updatePosition(creature, moveAction, collision),
            ongoingAction: null,
          }
        : mappedCreature,
    ),
  };
};

const applyAttack = (
  state: State,
  creature: Creature,
  attackAction: AttackAction,
): State => {
  const tileAttacked = getNewPosition(
    creature.position,
    attackAction.direction,
  );
  const attackedCreature = getCreatureAtPosition(state, tileAttacked);

  return {
    ...state,
    creatures: state.creatures.map((mappedCreature) => {
      if (mappedCreature.id === creature.id)
        return { ...creature, ongoingAction: null };
      if (mappedCreature.id === attackedCreature?.id)
        return { ...mappedCreature, health: mappedCreature.health - 1 };
      return mappedCreature;
    }),
  };
};

const applyOngoingAction = (state: State, creature: Creature): State => {
  switch (creature.ongoingAction?.type) {
    case "move":
      return applyMove(state, creature, creature.ongoingAction);
    case "attack":
      return applyAttack(state, creature, creature.ongoingAction);
    default:
      return state;
  }
};

export const getCreatureAtPosition = (state: State, position: Position) =>
  state.creatures.find(
    (creature) =>
      creature.position.x === position.x && creature.position.y === position.y,
  );
