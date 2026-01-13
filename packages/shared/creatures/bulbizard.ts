import {
  type Creature,
  type AttackAction,
  type CreatureName,
  CreatureKit,
} from "../state.js";

export const bulbizard: CreatureKit = {
  type: "bulbizard" as CreatureName,
  ActionQ: (creature: Creature): AttackAction => {
    return {
      type: "attack",
      direction: creature.direction,
    };
  },
  ActionW: (creature: Creature): AttackAction => {
    return {
      type: "attack",
      direction: creature.direction,
    };
  },
  ActionE: (creature: Creature): AttackAction => {
    return {
      type: "attack",
      direction: creature.direction,
    };
  },
};
