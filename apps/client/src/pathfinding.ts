import {
  collisionWithMap,
  getNewPosition,
  samePosition,
} from "@creatures/shared/gameLogicUtilities";
import {
  type Position,
  type MoveAction,
  type State,
  allDirections,
} from "@creatures/shared/state";

export const pathToTargetUsingBFS = (
  state: State,
  currentPosition: Position,
  targetPosition: Position,
) =>
  bfs(
    state,
    [
      {
        position: currentPosition,
        pathMove: [],
      },
    ],
    [currentPosition],
    targetPosition,
  );

type Crossroad = {
  position: Position;
  pathMove: MoveAction[];
};

const bfs = (
  state: State,
  queue: Crossroad[],
  visited: Position[],
  target: Position,
): MoveAction[] => {
  if (queue[0] === undefined) return []; // Couldn't find a path
  const [{ position, pathMove }, ...rest] = queue;

  if (samePosition(position, target)) {
    return pathMove;
  }

  const neighbors = accessibleNeighbors(state, position);

  const notVisited = (neighbor: {
    position: Position;
    moveAction: MoveAction;
  }) => !visited.some((v) => samePosition(v, neighbor.position));

  const neighborsToCheck = neighbors.filter(notVisited);

  const nextCrossroad: Crossroad[] = neighborsToCheck.map((n) => ({
    position: n.position,
    pathMove: [...pathMove, n.moveAction],
  }));

  return bfs(
    state,
    [...rest, ...nextCrossroad], // FIFO → BFS
    [...visited, ...neighborsToCheck.map((neighbor) => neighbor.position)],
    target,
  );
};

const accessibleNeighbors = (state: State, { x, y }: Position) => {
  const neighbors = allDirections.map((direction) => ({
    position: getNewPosition({ x, y }, direction),
    moveAction: { type: "move", direction } as const,
  }));
  return neighbors.filter(
    (neighbor) => !collisionWithMap(state.map, neighbor.position),
  );
};

export const pathToTarget = (
  currentPosition: Position,
  targetPosition: Position,
) => {
  const nextActionsX =
    currentPosition.x < targetPosition.x
      ? new Array(targetPosition.x - currentPosition.x).fill({
          type: "move",
          direction: "right",
        })
      : new Array(currentPosition.x - targetPosition.x).fill({
          type: "move",
          direction: "left",
        });
  const nextActionsY =
    currentPosition.y < targetPosition.y
      ? new Array(targetPosition.y - currentPosition.y).fill({
          type: "move",
          direction: "down",
        })
      : new Array(currentPosition.y - targetPosition.y).fill({
          type: "move",
          direction: "up",
        });
  return [...nextActionsX, ...nextActionsY];
};
