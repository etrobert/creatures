import { type State } from "@creatures/shared/state";

import { getEntity } from "@creatures/shared/gameLogicUtilities";

import {
  applyAttack,
  applyCharge,
  applyFireball,
  applyFireballMove,
  applyMove,
  updateEntityById,
} from "./applyActions.js";

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
    case "charge":
      return applyCharge(state, entity);
    default:
      return state;
  }
};
