import { bulbizard } from "./creatures/bulbizard.js";
import { salameche } from "./creatures/salameche.js";
import { type CreatureKit, type CreatureName } from "./state.js";

export const getCreatureKit = (creatureName: CreatureName): CreatureKit => {
  const kit = creaturePoolKits.find(
    (creatureKit: CreatureKit) => creatureKit.type === creatureName,
  );
  if (kit === undefined) throw new Error("Creature has no kit");
  return kit;
};

const creaturePoolKits = [bulbizard, salameche];
