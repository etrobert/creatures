// Game state types and constants

export type Position = { x: number; y: number };

export type Direction = "up" | "right" | "left" | "down";

export type MoveAction = {
  type: "move";
  direction: Direction;
};

export type AttackAction = {
  type: "attack";
  direction: Direction;
};

export type Action = MoveAction | AttackAction;

export type Creature = {
  id: string;
  player: number;
  health: number;
  maxHealth: number;
  position: Position;
  ongoingAction: Action | null;
  nextActions: Action[];
  direction: Direction;
};

export type State = {
  lastTick: number;
  creatures: Creature[];
};

export const countColumns = 10;
export const countRow = 7;
