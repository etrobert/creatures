import {
  collisionWithMap,
  updatePosition,
  getNewPosition,
  type AttackAction,
  type Creature,
  type Position,
  type State,
  type MoveAction,
  type Projectile,
  type AttackFireballAction,
} from "@creatures/shared/state";
import { createFireball } from "./state.js";

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

const applyAttackFireball = (
  state: State,
  creature: Creature,
  attackAction: AttackFireballAction,
): State => {
  const spawnedFireball = createFireball(
    creature.position,
    attackAction.direction,
  );
  return {
    ...state,
    projectiles: [...state.projectiles, spawnedFireball],
    creatures: state.creatures.map((mappedCreature) => {
      if (mappedCreature.id === creature.id)
        return { ...creature, ongoingAction: null };
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
    case "attackFireball":
      return applyAttackFireball(state, creature, creature.ongoingAction);
    default:
      return state;
  }
};

export const getCreatureAtPosition = (state: State, position: Position) =>
  state.creatures.find(
    (creature) =>
      creature.position.x === position.x && creature.position.y === position.y,
  );

export const updateProjectile = (
  state: State,
  projectile: Projectile,
): State => {
  const newPosition = getNewPosition(projectile.position, projectile.direction);
  const updatedProjectile = state.projectiles.map((mappedProjectile) => {
    if (mappedProjectile.id === projectile.id)
      return {
        ...projectile,
        position: newPosition,
      };
    return mappedProjectile;
  });
  const updatedCreatures = state.creatures.map((mappedCreature) => {
    if (samePosition(mappedCreature.position, newPosition))
      return { ...mappedCreature, health: mappedCreature.health - 1 };
    return mappedCreature;
  });
  return {
    ...state,
    projectiles: updatedProjectile,
    creatures: updatedCreatures,
  };
};

const samePosition = (position1: Position, position2: Position) => {
  return position1.x === position2.x && position1.y === position2.y;
};
