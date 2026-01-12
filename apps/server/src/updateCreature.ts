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
    entities: state.entities.map((entity) =>
      entity.id === creature.id
        ? {
            ...updatePosition(creature, moveAction, collision),
            ongoingAction: null,
          }
        : entity,
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
    entities: state.entities.map((entity) => {
      if (entity.id === creature.id)
        return { ...creature, ongoingAction: null };
      if (entity.id === attackedCreature?.id)
        return { ...entity, health: entity.health - 1 };
      return entity;
    }),
  };
};

const applyFireball = (state: State, creature: Creature): State => {
  const spawnedFireball = createFireball(creature.position, creature.direction);
  return {
    ...state,
    projectiles: [...state.projectiles, spawnedFireball],
    entities: state.entities.map((entity) => {
      if (entity.id === creature.id)
        return { ...creature, ongoingAction: null };
      return entity;
    }),
  };
};

const applyOngoingAction = (state: State, creature: Creature): State => {
  switch (creature.ongoingAction?.type) {
    case "move":
      return applyMove(state, creature, creature.ongoingAction);
    case "attack":
      return applyAttack(state, creature, creature.ongoingAction);
    case "fireball":
      return applyFireball(state, creature);
    default:
      return state;
  }
};

export const getCreatureAtPosition = (state: State, position: Position) =>
  state.entities
    .filter((entity) => entity.type === "creature")
    .find(
      (creature) =>
        creature.position.x === position.x &&
        creature.position.y === position.y,
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
  const updatedEntities = state.entities
    .filter((entity) => entity.type === "creature")
    .map((mappedCreature) => {
      if (samePosition(mappedCreature.position, newPosition))
        return { ...mappedCreature, health: mappedCreature.health - 1 };
      return mappedCreature;
    });
  return {
    ...state,
    projectiles: updatedProjectile,
    entities: updatedEntities,
  };
};

const samePosition = (position1: Position, position2: Position) =>
  position1.x === position2.x && position1.y === position2.y;
