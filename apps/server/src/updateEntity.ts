import {
  type AttackAction,
  type Position,
  type State,
  type MoveAction,
  type Entity,
  type Creature,
  type DashAction,
} from "@creatures/shared/state";

import {
  collisionWithMap,
  updatePosition,
  getNewPosition,
  isCreature,
} from "@creatures/shared/gameLogicUtilities";

import { createFireball } from "./state.js";

export const updateEntity = (state: State, entityId: string): State => {
  state = updateActions(state, entityId);
  return applyOngoingAction(state, entityId);
};

const updateActions = (state: State, entityId: string): State => {
  const entity = getEntity(state, entityId);
  if (entity.ongoingAction) return state;
  const [ongoingAction, ...nextActions] = entity.nextActions;
  if (!ongoingAction) return state;
  return updateEntityById(state, entityId, (entity) => ({
    ...entity,
    ongoingAction,
    nextActions,
  }));
};

const applyMove = (
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

const applyAttack = (
  state: State,
  entity: Entity,
  attackAction: AttackAction,
): State => {
  const tileAttacked = getNewPosition(entity.position, attackAction.direction);

  state = resetEntityOngoingAction(state, entity.id);
  state = dealDamageAtPosition(state, tileAttacked, 1);

  return state;
};

const applyDash = (
  state: State,
  entity: Entity,
  dashAction: DashAction,
): State => {
  let tileDash = entity.position;
  for (let i = 0; i < 3; i++) {
    let tileDashNext = getNewPosition(tileDash, entity.direction);
    if (collisionWithMap(state.map, tileDashNext)) break;
    tileDash = tileDashNext;
    state = dealDamageAtPosition(state, tileDash, 1);
  }
  state = resetEntityOngoingAction(state, entity.id);
  state = updateEntityById(state, entity.id, (entity) => {
    return { ...entity, position: tileDash };
  });
  return state;
};

const dealDamageAtPosition = (
  state: State,
  position: Position,
  damage: number,
): State => ({
  ...state,
  entities: state.entities.map((entity) =>
    entity.type === "creature" &&
    entity.position.x === position.x &&
    entity.position.y === position.y
      ? { ...entity, health: entity.health - damage }
      : entity,
  ),
});

const dealFireballDamage = (state: State, position: Position) =>
  dealDamageAtPosition(state, position, 1);

const updateEntityById = (
  state: State,
  entityId: string,
  update: (entity: Entity) => Entity,
) => ({
  ...state,
  entities: state.entities.map((entity) =>
    entity.id === entityId ? update(entity) : entity,
  ),
});

const resetEntityOngoingAction = (state: State, entityId: string) =>
  updateEntityById(state, entityId, (entity) => ({
    ...entity,
    ongoingAction: null,
  }));

const applyFireball = (state: State, creature: Entity): State => {
  const position = getNewPosition(creature.position, creature.direction);
  const spawnedFireball = createFireball(position, creature.direction);

  state = resetEntityOngoingAction(state, creature.id);
  state = dealFireballDamage(state, position);

  return { ...state, entities: [...state.entities, spawnedFireball] };
};

const applyOngoingAction = (state: State, entityId: string): State => {
  const entity = getEntity(state, entityId);
  switch (entity.ongoingAction?.type) {
    case "move":
      return applyMove(state, entity, entity.ongoingAction);
    case "attack":
      return applyAttack(state, entity, entity.ongoingAction);
    case "fireball":
      return applyFireball(state, entity);
    case "fireball:move":
      return applyFireballMove(state, entity);
    case "dash":
      return applyDash(state, entity, entity.ongoingAction);
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
  const newPosition = getNewPosition(fireball.position, fireball.direction);

  if (collisionWithMap(state.map, newPosition))
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

const getEntity = (state: State, entityId: string): Entity => {
  const entity = state.entities.find(({ id }) => id === entityId);
  if (entity === undefined) throw new Error("entity not found");
  return entity;
};
