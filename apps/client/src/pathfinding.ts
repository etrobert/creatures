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

type Node = {
  position: Position;
  pathMove: MoveAction[];
};

const bfs = (
  state: State,
  queue: Node[],
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

  const nextNodes: Node[] = neighborsToCheck.map((n) => ({
    position: n.position,
    pathMove: [...pathMove, n.moveAction],
  }));

  return bfs(
    state,
    [...rest, ...nextNodes], // FIFO → BFS
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
