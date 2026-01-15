import {
  type Creature,
  type CreatureName,
  type CreatureKit,
  type Action,
} from "../state.js";

export const bulbizard: CreatureKit = {
  type: "bulbizard" as CreatureName,
  actionQ: (creature: Creature): Action => {
    return {
      type: "attack",
      direction: creature.direction,
    };
  },
  actionW: (creature: Creature): Action => {
    return {
      type: "attack",
      direction: creature.direction,
    };
  },
  actionE: (creature: Creature): Action => {
    return { type: "fireball" };
  },
};
