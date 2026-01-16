import {
  countColumns,
  countRow,
  type GameMap,
  type Position,
} from "@creatures/shared/state";
import { backgroundTilesPositions } from "./backgroundTilesPositions.js";

import { ctx } from "./render.js";
import { getTile } from "@creatures/shared/gameLogicUtilities";

const getBackgroundTile = (background: GameMap, position: Position) => {
  const tile = background[position.x + position.y * countColumns * 2];
  if (tile === undefined) throw new Error("incorrect position");
  return tile;
};

const getBackgroundTilesMap = (backgroundMap: GameMap) => {
  let backgroundTilesMap = new Array();
  for (let yn = 0; yn < countRow * 2; yn++) {
    for (let xn = 0; xn < countColumns * 2; xn++) {
      const x = Math.floor(xn / 2);
      const y = Math.floor(yn / 2);
      backgroundTilesMap = [
        ...backgroundTilesMap,
        getTile(backgroundMap, { x, y }),
      ];
    }
  }
  return backgroundTilesMap;
};

export const renderBackground = (map: GameMap) => {
  const backgroundTilesMap = getBackgroundTilesMap(map);
  const moreRows = countRow * 2 + 1;
  const moreColumns = countColumns * 2 + 1;
  for (let y = 0; y < moreRows; y++) {
    for (let x = 0; x < moreColumns; x++) {
      const corners = {
        NW:
          x === 0 || y === 0
            ? "void"
            : getBackgroundTile(backgroundTilesMap, { x: x - 1, y: y - 1 }),
        NE:
          x === moreColumns - 1 || y === 0
            ? "void"
            : getBackgroundTile(backgroundTilesMap, { x, y: y - 1 }),
        SW:
          x === 0 || y === moreRows - 1
            ? "void"
            : getBackgroundTile(backgroundTilesMap, { x: x - 1, y }),
        SE:
          x === moreColumns - 1 || y === moreRows - 1
            ? "void"
            : getBackgroundTile(backgroundTilesMap, { x, y }),
      };
      renderBackgroundTile(corners, x, y);
    }
  }
};

const backgroundTiles = new Image();
backgroundTiles.src = "./sprites/background/Grass_tiles_v2.png";

const renderBackgroundTile = (
  corners: { NW: string; NE: string; SW: string; SE: string },
  x: number,
  y: number,
) => {
  const backgroundTilePosition = backgroundTilesPositions.find(
    (data) =>
      data.corners.NE === corners.NE &&
      data.corners.NW === corners.NW &&
      data.corners.SE === corners.SE &&
      data.corners.SW === corners.SW,
  );
  if (backgroundTilePosition === undefined) throw new Error("No tile found");

  const canvasPosition = backgroundTileToCanvas({ x, y });
  ctx.drawImage(
    backgroundTiles,
    backgroundTilePosition.position.x,
    backgroundTilePosition.position.y,
    backgroundTileWidth,
    backgroundTileHeight,
    canvasPosition.x,
    canvasPosition.y,
    backgroundTileWidth,
    backgroundTileHeight,
  );
};

const backgroundTileWidth = 16;
const backgroundTileHeight = 16;

// translation bewtween grid position and canvas position
const backgroundTileToCanvas = ({ x, y }: Position) => ({
  x: x * backgroundTileWidth + backgroundTileWidth / 2,
  y: y * backgroundTileHeight + backgroundTileHeight / 2,
});
