import { bulbizard } from "./creatureKits/bulbizard.js";
import { salameche } from "./creatureKits/salameche.js";
import { type CreatureKit, type CreatureName } from "./state.js";

export const getCreatureKit = (creatureName: CreatureName): CreatureKit => {
  const kit = creaturePoolKits.find(
    (creatureKit: CreatureKit) => creatureKit.name === creatureName,
  );
  if (kit === undefined) throw new Error("Creature has no kit");
  return kit;
};

const creaturePoolKits = [bulbizard, salameche];
