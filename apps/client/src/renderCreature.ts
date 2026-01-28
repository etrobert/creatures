import { ctx } from "./render.js";
import { cellWidth, gridToCanvas } from "./render.js";
import {
  tickDuration,
  type Creature,
  type Direction,
} from "@creatures/shared/state";

const getDirectionLine = (direction: Direction) => {
  switch (direction) {
    case "down":
      return 0;
    case "right":
      return 2;
    case "left":
      return 6;
    case "up":
      return 4;
  }
};

export const renderCreature = (creature: Creature, currentTime: number) => {
  const canvasPosition = gridToCanvas(creature.position);
  const animation = getAnimation(creature);
  const { animationFrames, imgWidth, imgHeight } = animation;
  const frameDuration = tickDuration / animationFrames;
  ctx.drawImage(
    animation.sprite,
    (Math.floor(currentTime / frameDuration) % animationFrames) * imgWidth,
    getDirectionLine(creature.direction) * imgHeight,
    imgWidth,
    imgHeight,
    canvasPosition.x - (imgWidth - cellWidth) / 2,
    canvasPosition.y - (imgWidth - cellWidth) / 2,
    imgWidth,
    imgHeight,
  );
};

const getAnimation = (creature: Creature): Animation => {
  const entityAnimations = entitiesAnimations[creature.name];

  const { ongoingAction } = creature;

  if (ongoingAction === null) return entityAnimations.default;

  const ongoingActionType = ongoingAction.type;

  const animation = entityAnimations[ongoingActionType];

  return animation === undefined ? entityAnimations.default : animation;
};

const imgBulbizard = new Image();
imgBulbizard.src = "/sprites/animations/bulbasaur/Walk-Anim.png";
const animationBulbizard = {
  sprite: imgBulbizard,
  imgWidth: 40,
  imgHeight: 40,
  animationFrames: 6,
} satisfies Animation;

const imgSalameche = new Image();
imgSalameche.src = "/sprites/animations/salameche/Walk-Anim.png";
const animationSalameche = {
  sprite: imgSalameche,
  imgWidth: 32,
  imgHeight: 32,
  animationFrames: 4,
} satisfies Animation;

type Animation = {
  sprite: HTMLImageElement;
  imgWidth: number;
  imgHeight: number;
  animationFrames: number;
};

const bulbizardAnimations: Record<string, Animation> & { default: Animation } =
  {
    attack: animationSalameche,
    default: animationBulbizard,
  };

const salamecheAnimations: Record<string, Animation> & { default: Animation } =
  {
    default: animationSalameche,
  };

const entitiesAnimations = {
  bulbizard: bulbizardAnimations,
  salameche: salamecheAnimations,
};
