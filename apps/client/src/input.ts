import { setState, state } from "./state.js";
import { canvas, cellWidth, cellHeight } from "./render.js";
import type { Position } from "./state.js";
import { activePlayer } from "./index.js";
import { collisionWithMap, getCreatureAtPosition } from "./updateCreature.js";

export const setupEventListeners = () => {
  window.addEventListener("keydown", (event) => {
    const activeCreature = findActiveCreature(0);
    if (activeCreature === undefined)
      throw new Error("Couldn't find active creature");
    const getAction = () => {
      switch (event.code) {
        case "KeyW":
          return { type: "move", direction: "up" } as const;
        case "KeyA":
          return { type: "move", direction: "left" } as const;
        case "KeyS":
          return { type: "move", direction: "down" } as const;
        case "KeyD":
          return { type: "move", direction: "right" } as const;
        case "KeyQ": {
          return {
            type: "attack",
            direction: activeCreature.direction,
          } as const;
        }
      }
    };

    const newAction = getAction();

    if (newAction === undefined) return;

    setState({
      ...state,
      creatures: state.creatures.map((creature) =>
        creature.player === activePlayer
          ? {
              ...creature,
              nextActions: [...creature.nextActions, newAction],
            }
          : creature,
      ),
    });
  });

  canvas.addEventListener("click", (event) => {
    const clickPosition = canvasToGrid({ x: event.offsetX, y: event.offsetY });
    const activeCreature = findActiveCreature(activePlayer);
    if (activeCreature === undefined) return;
    setState({
      ...state,
      creatures: state.creatures.map((creature) =>
        creature.player === activePlayer
          ? {
              ...creature,
              nextActions: [
                ...creature.nextActions,
                { type: "movePath", position: clickPosition },
              ],
            }
          : creature,
      ),
    });
  });
};

export const pathToTarget = (
  currentPosition: Position,
  TargetPosition: Position,
) => {
  const nextActionsX =
    currentPosition.x < TargetPosition.x
      ? new Array(TargetPosition.x - currentPosition.x).fill({
          type: "move",
          direction: "right",
        })
      : new Array(currentPosition.x - TargetPosition.x).fill({
          type: "move",
          direction: "left",
        });
  const nextActionsY =
    currentPosition.y < TargetPosition.y
      ? new Array(TargetPosition.y - currentPosition.y).fill({
          type: "move",
          direction: "down",
        })
      : new Array(currentPosition.y - TargetPosition.y).fill({
          type: "move",
          direction: "up",
        });
  return [...nextActionsX, ...nextActionsY];
};

const samePosition = (a: Position, b: Position): boolean =>
  a.x === b.x && a.y === b.y;

export const pathToTargetBFS = (
  currentPosition: Position,
  targetPosition: Position,
): MoveAction[] | null => {
  const bfsPath = bfs(
    [{ pos: currentPosition, path: [currentPosition] }],
    [currentPosition],
    targetPosition,
  );
  return bfsPath === null ? null : lostLocationsToPathMove(bfsPath);
};

type Node = {
  pos: Position;
  path: Position[];
};
export const bfs = (
  queue: Node[],
  visited: Position[],
  target: Position,
): Position[] | null => {
  if (queue[0] === undefined) return null;
  //  throw new Error("Couldn't find a path");
  const [{ pos, path }, ...rest] = queue;

  if (samePosition(pos, target)) {
    return path;
  }

  const neighbors = accessibleNeighbors(pos);

  const notVisited = (p: Position) => !visited.some((v) => samePosition(v, p));

  const neighborsToCheck = neighbors.filter(notVisited);

  const nextNodes: Node[] = neighborsToCheck.map((n) => ({
    pos: n,
    path: [...path, n],
  }));

  return bfs(
    [...rest, ...nextNodes], // FIFO → BFS
    [...visited, ...neighborsToCheck],
    target,
  );
};

const accessibleNeighbors = ({ x, y }: Position) => {
  const pos = [
    { x: x, y: y + 1 },
    { x: x, y: y - 1 },
    { x: x + 1, y: y },
    { x: x - 1, y: y },
  ];
  const collision = (newPosition: Position) => {
    const creatureAtPosition = getCreatureAtPosition(state, newPosition);
    return collisionWithMap(newPosition);
    // || creatureAtPosition !== undefined;
  };
  return pos.filter((pos) => !collision(pos));
};

const lostLocationsToPathMove = (positions: Position[]) => {
  let nextActions: MoveAction[] = [];
  for (let i = 0; i <= positions.length - 2; i++) {
    const currentPosition = positions[i];
    const targetPosition = positions[i + 1];
    if (currentPosition !== undefined && targetPosition !== undefined) {
      const nextAction: MoveAction =
        currentPosition.x < targetPosition.x
          ? {
              type: "move",
              direction: "right",
            }
          : currentPosition.x > targetPosition.x
            ? {
                type: "move",
                direction: "left",
              }
            : currentPosition.y < targetPosition.y
              ? {
                  type: "move",
                  direction: "down",
                }
              : {
                  type: "move",
                  direction: "up",
                };
      nextActions = [...nextActions, nextAction];
    }
  }

  return nextActions;
};

const findActiveCreature = (player: number) =>
  state.creatures.find((creature) => creature.player === player);

// translation bwtween grid position and canvas position
const canvasToGrid = ({ x, y }: Position) => ({
  x: Math.floor((x - cellWidth / 2) / cellWidth),
  y: Math.floor((y - cellHeight / 2) / cellHeight),
});
