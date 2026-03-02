import { ctx } from "./render.js";
import { cellWidth, gridToCanvas } from "./render.js";
import {
  tickDuration,
  type Creature,
  type Direction,
  type Position,
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

const subPositions = (pos1: Position, pos2: Position): Position => ({
  x: pos1.x - pos2.x,
  y: pos1.y - pos2.y,
});

const addPositions = (pos1: Position, pos2: Position): Position => ({
  x: pos1.x + pos2.x,
  y: pos1.y + pos2.y,
});

const multiplyPosition = (pos: Position, n: number): Position => ({
  x: pos.x * n,
  y: pos.y * n,
});

const getPosition = (creature: Creature, currentTime: number) => {
  const canvasPosition = gridToCanvas(creature.position);
  if (creature.previousPosition === null) return canvasPosition;
  const canvasPreviousPosition = gridToCanvas(creature.previousPosition);
  const progress = (currentTime - tickStart) / tickDuration;
  const positionDifference = subPositions(
    canvasPosition,
    canvasPreviousPosition,
  );
  return addPositions(
    canvasPreviousPosition,
    multiplyPosition(positionDifference, progress),
  );
};

export const renderCreature = (creature: Creature, currentTime: number) => {
  const canvasPosition = getPosition(creature, currentTime);
  const animation = getAnimation(creature);
  const { animationFrames, imgWidth, imgHeight } = animation;
  const frameDuration = tickDuration / animationFrames;

  ctx.drawImage(
    animation.sprite,
    (Math.floor((currentTime - tickStart) / frameDuration) % animationFrames) *
      imgWidth,
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

const entitiesAnimations = {
  bulbizard: bulbizardAnimations,
  salameche: salamecheAnimations,
};
