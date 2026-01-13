import { bulbizard } from "./creatures/bulbizard";
import { type CreatureKit, type CreatureName } from "./state";

export const accessKit = (creatureName: CreatureName) => {
  creaturePoolKits.filter(
    (creatureKit: CreatureKit) => creatureKit.type === creatureName,
  );
};

const creaturePoolKits = [bulbizard];
