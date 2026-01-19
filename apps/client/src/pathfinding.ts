import {
  collisionWithMap,
  samePosition,
} from "@creatures/shared/gameLogicUtilities";
import type { Position, MoveAction, State } from "@creatures/shared/state";

export const pathToTargetUsingBFS = (
  state: State,
  currentPosition: Position,
  targetPosition: Position,
) =>
  bfs(
    state,
    [{ pos: currentPosition, pathPosition: [currentPosition], pathMove: [] }],
    [currentPosition],
    targetPosition,
  );

type Node = {
  pos: Position;
  pathPosition: Position[];
  pathMove: MoveAction[];
};

const bfs = (
  state: State,
  queue: Node[],
  visited: Position[],
  target: Position,
): MoveAction[] => {
  if (queue[0] === undefined) throw new Error("Couldn't find a path");
  const [{ pos, pathPosition, pathMove }, ...rest] = queue;

  if (samePosition(pos, target)) {
    return pathMove;
  }

  const neighbors = accessibleNeighbors(state, pos);

  const notVisited = (neighbor: {
    position: Position;
    moveAction: MoveAction;
  }) => !visited.some((v) => samePosition(v, neighbor.position));

  const neighborsToCheck = neighbors.filter(notVisited);

  const nextNodes: Node[] = neighborsToCheck.map((n) => ({
    pos: n.position,
    pathPosition: [...pathPosition, n.position],
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
  const neighbors = [
    {
      position: { x: x, y: y + 1 },
      moveAction: { type: "move", direction: "down" },
    },
    {
      position: { x: x, y: y - 1 },
      moveAction: { type: "move", direction: "up" },
    },
    {
      position: { x: x + 1, y: y },
      moveAction: { type: "move", direction: "right" },
    },
    {
      position: { x: x - 1, y: y },
      moveAction: { type: "move", direction: "left" },
    },
  ] as const;
  const collision = (state: State, newPosition: Position) => {
    // const creatureAtPosition = getCreatureAtPosition(state, newPosition);
    return collisionWithMap(state.map, newPosition);
    //   creatureAtPosition !== undefined
  };
  return neighbors.filter((neighbor) => !collision(state, neighbor.position));
};
