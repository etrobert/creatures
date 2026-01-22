import type { State, Entity, Position } from "@creatures/shared/state";

export const updateEntityById = (
  state: State,
  entityId: string,
  update: (entity: Entity) => Entity,
) => ({
  ...state,
  entities: state.entities.map((entity) =>
    entity.id === entityId ? update(entity) : entity,
  ),
});

export const resetEntityOngoingAction = (state: State, entityId: string) =>
  updateEntityById(state, entityId, (entity) => ({
    ...entity,
    ongoingAction: null,
  }));

export const dealDamageAtPosition = (
  state: State,
  position: Position,
  damage: number,
): State => ({
  ...state,
  entities: state.entities
    .map((entity) =>
      entity.type === "creature" &&
      entity.position.x === position.x &&
      entity.position.y === position.y
        ? { ...entity, health: entity.health - damage }
        : entity,
    )
    .filter((entity) => entity.type !== "creature" || entity.health > 0),
});
