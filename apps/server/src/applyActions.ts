import {
  getCreatureAtPosition,
  collisionWithMap,
  updatePosition,
  getNewPosition,
  outerMapCollision,
} from "@creatures/shared/gameLogicUtilities";
import type {
  State,
  Entity,
  MoveAction,
  Position,
  AttackAction,
} from "@creatures/shared/state";
import { createFireball } from "./state.js";
import {
  updateEntityById,
  resetEntityOngoingAction,
  dealDamageAtPosition,
} from "./actionUtilities.js";

export const applyMove = (
  state: State,
  creature: Entity,
  moveAction: MoveAction,
): State => {
  const collision = (newPosition: Position) => {
    const creatureAtPosition = getCreatureAtPosition(state, newPosition);
    return (
      collisionWithMap(state.map, newPosition) ||
      creatureAtPosition !== undefined
    );
  };
  return updateEntityById(state, creature.id, (entity) => ({
    ...updatePosition(entity, moveAction, collision),
    ongoingAction: null,
  }));
};

export const applyAttack = (
  state: State,
  entity: Entity,
  attackAction: AttackAction,
): State => {
  const tileAttacked = getNewPosition(entity.position, attackAction.direction);

  state = resetEntityOngoingAction(state, entity.id);
  state = dealDamageAtPosition(state, tileAttacked, 1);

  return state;
};

const isValidChargeDestination = (state: State, position: Position) =>
  !collisionWithMap(state.map, position) &&
  getCreatureAtPosition(state, position) === undefined;

const getChargeDestination = (state: State, entity: Entity) => {
  const firstTile = getNewPosition(entity.position, entity.direction);
  const secondTile = getNewPosition(firstTile, entity.direction);
  const thirdTile = getNewPosition(secondTile, entity.direction);

  if (isValidChargeDestination(state, thirdTile)) return thirdTile;
  if (isValidChargeDestination(state, secondTile)) return secondTile;
  if (isValidChargeDestination(state, firstTile)) return firstTile;
  return entity.position;
};

export const applyCharge = (state: State, entity: Entity): State => {
  const destination = getChargeDestination(state, entity);

  if (
    destination.x === entity.position.x &&
    destination.y === entity.position.y
  )
    return resetEntityOngoingAction(state, entity.id);

  for (
    let tile = getNewPosition(entity.position, entity.direction);
    tile.x !== destination.x || tile.y !== destination.y;
    tile = getNewPosition(tile, entity.direction)
  )
    state = dealDamageAtPosition(state, tile, 1);

  state = updateEntityById(state, entity.id, (entity) => ({
    ...entity,
    position: destination,
    ongoingAction: null,
  }));
  return state;
};

const dealFireballDamage = (state: State, position: Position) =>
  dealDamageAtPosition(state, position, 1);

export const applyFireball = (state: State, creature: Entity): State => {
  const position = getNewPosition(creature.position, creature.direction);
  const spawnedFireball = createFireball(position, creature.direction);

  state = resetEntityOngoingAction(state, creature.id);
  state = dealFireballDamage(state, position);

  return { ...state, entities: [...state.entities, spawnedFireball] };
};

export const applyFireballMove = (state: State, fireball: Entity): State => {
  const newPosition = getNewPosition(fireball.position, fireball.direction);

  if (outerMapCollision(newPosition))
    return {
      ...state,
      entities: state.entities.filter((entity) => entity.id !== fireball.id),
    };

  const updatedEntities = state.entities.map((entity) =>
    entity.id === fireball.id ? { ...entity, position: newPosition } : entity,
  );

  return dealFireballDamage(
    { ...state, entities: updatedEntities },
    newPosition,
  );
};
