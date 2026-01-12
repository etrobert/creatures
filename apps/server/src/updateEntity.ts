import {
  collisionWithMap,
  updatePosition,
  getNewPosition,
  type AttackAction,
  type Position,
  type State,
  type MoveAction,
  type Entity,
  type Creature,
  isCreature,
} from "@creatures/shared/state";
import { createFireball } from "./state.js";

export const updateEntity = (state: State, entity: Entity): State => {
  entity = updateActions(entity);
  return applyOngoingAction(state, entity);
};

const updateActions = (creature: Entity) => {
  if (creature.ongoingAction) return creature;
  const [ongoingAction, ...nextActions] = creature.nextActions;
  if (!ongoingAction) return creature;
  return { ...creature, ongoingAction, nextActions };
};

const applyMove = (
  state: State,
  creature: Entity,
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
  creature: Entity,
  attackAction: AttackAction,
): State => {
  const tileAttacked = getNewPosition(
    creature.position,
    attackAction.direction,
  );
  const attackedCreature = getCreatureAtPosition(state, tileAttacked);

  return {
    ...state,
    entities: state.entities
      .filter((entity) => entity.type === "creature")
      .map((entity) => {
        if (entity.id === creature.id)
          return { ...creature, ongoingAction: null };
        if (entity.id === attackedCreature?.id)
          return { ...entity, health: entity.health - 1 };
        return entity;
      }),
  };
};

const applyFireball = (state: State, creature: Entity): State => {
  const spawnedFireball = createFireball(creature.position, creature.direction);
  return {
    ...state,
    entities: [
      ...state.entities.map((entity) =>
        entity.id === creature.id
          ? { ...creature, ongoingAction: null }
          : entity,
      ),
      spawnedFireball,
    ],
  };
};

const applyOngoingAction = (state: State, entity: Entity): State => {
  switch (entity.ongoingAction?.type) {
    case "move":
      return applyMove(state, entity, entity.ongoingAction);
    case "attack":
      return applyAttack(state, entity, entity.ongoingAction);
    case "fireball":
      return applyFireball(state, entity);
    case "fireball move":
      return applyFireballMove(state, entity);
    default:
      return state;
  }
};

export const getCreatureAtPosition = (
  state: State,
  position: Position,
): Creature | undefined =>
  state.entities
    .filter(isCreature)
    .find(
      (creature) =>
        creature.position.x === position.x &&
        creature.position.y === position.y,
    );

export const applyFireballMove = (state: State, fireball: Entity): State => {
  // TODO: destroy fireball when it goes out of the map

  const newPosition = getNewPosition(fireball.position, fireball.direction);

  const updatedEntities = state.entities
    .map((entity) =>
      entity.id === fireball.id
        ? {
            ...entity,
            position: newPosition,
          }
        : entity,
    )
    .map((entity) =>
      entity.type === "creature" &&
      entity.position.x === newPosition.x &&
      entity.position.y === newPosition.y
        ? { ...entity, health: entity.health - 1 }
        : entity,
    );

  return { ...state, entities: updatedEntities };
};
