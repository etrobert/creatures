import { ctx } from "./render.js";
import { cellWidth } from "./render.js";
import {
  tickDuration,
  type Direction,
  type Position,
  type Entity,
} from "@creatures/shared/state";
import { tickStart } from "./state.js";

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

export const renderEntityAnimation = (
  entity: Entity,
  canvasPosition: Position,
  currentTime: number,
) => {
  const animation = getAnimation(entity);
  const { animationFrames, imgWidth, imgHeight } = animation;
  const frameDuration = tickDuration / animationFrames;

  ctx.drawImage(
    animation.sprite,
    (Math.floor((currentTime - tickStart) / frameDuration) % animationFrames) *
      imgWidth,
    getDirectionLine(entity.direction) * imgHeight,
    imgWidth,
    imgHeight,
    canvasPosition.x - (imgWidth - cellWidth) / 2,
    canvasPosition.y - (imgWidth - cellWidth) / 2,
    imgWidth,
    imgHeight,
  );
};

const getAnimation = (creature: Entity): Animation => {
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

const imgBulbizardAttack = new Image();
imgBulbizardAttack.src = "/sprites/animations/bulbasaur/Attack-Anim.png";
const animationBulbizardAttack = {
  sprite: imgBulbizardAttack,
  imgWidth: 64,
  imgHeight: 72,
  animationFrames: 11,
} satisfies Animation;

const imgBulbizardSwing = new Image();
imgBulbizardSwing.src = "/sprites/animations/bulbasaur/Swing-Anim.png";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const animationBulbizardSwing = {
  sprite: imgBulbizardSwing,
  imgWidth: 72,
  imgHeight: 72,
  animationFrames: 9,
} satisfies Animation;

const imgSalameche = new Image();
imgSalameche.src = "/sprites/animations/salameche/Walk-Anim.png";
const animationSalameche = {
  sprite: imgSalameche,
  imgWidth: 32,
  imgHeight: 32,
  animationFrames: 4,
} satisfies Animation;

const imgFireball = new Image();
imgFireball.src = "/sprites/animations/Fireball/allFireball.png";
const fireballAnimation = {
  sprite: imgFireball,
  imgWidth: 32,
  imgHeight: 32,
  animationFrames: 2,
} satisfies Animation;

type Animation = {
  sprite: HTMLImageElement;
  imgWidth: number;
  imgHeight: number;
  animationFrames: number;
};

type AnimationSet = Record<string, Animation> & { default: Animation };

const bulbizardAnimations: AnimationSet = {
  attack: animationBulbizardAttack,
  default: animationBulbizard,
};

const salamecheAnimations: AnimationSet = {
  default: animationSalameche,
};

const fireballAnimations: AnimationSet = {
  default: fireballAnimation,
};

const entitiesAnimations = {
  bulbizard: bulbizardAnimations,
  salameche: salamecheAnimations,
  fireball: fireballAnimations,
};
