import { backgroundTilesPositions } from "./backgroundTilesPositions.js";
import { countColumns, countRow, type Position } from "./state.js";

import { ctx } from "./render.js";

const getTile = (background: string[], position: { x: number; y: number }) => {
  const tile = background[position.x + position.y * countColumns];
  if (tile === undefined) throw new Error("incorrect position");
  return tile;
};

export const initialBackground = new Array(countColumns * countRow).fill(
  "grass",
);

export const renderBackground = (background: string[]) => {
  for (let x = 0; x < countColumns; x++) {
    for (let y = 0; y < countRow; y++) {
      const corners = {
        NW:
          x === 0 || y === 0
            ? "void"
            : getTile(background, { x: x - 1, y: y - 1 }),
        NE:
          x === countColumns - 1 || y === 0
            ? "void"
            : getTile(background, { x, y: y - 1 }),
        SW:
          x === 0 || y === countRow - 1
            ? "void"
            : getTile(background, { x: x - 1, y }),
        SE:
          x === countColumns - 1 || y === countRow - 1
            ? "void"
            : getTile(background, { x, y }),
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
  const imgWidth = 32;
  const imgHeight = 32;
  const canvasPosition = positionOnCanvas({ x, y });
  if (ctx === null) throw new Error("Could not get ctx");
  ctx.drawImage(
    backgroundTiles,
    backgroundTilePosition.position.x,
    backgroundTilePosition.position.y,
    imgWidth,
    imgHeight,
    canvasPosition.canvasX,
    canvasPosition.canvasY,
    imgWidth,
    imgHeight,
  );
};

const tileWidth = 32;
const tileHeight = 32;

// translation bwtween grid position and canvas position
const positionOnCanvas = ({ x, y }: Position) => ({
  canvasX: x * tileWidth,
  canvasY: y * tileHeight,
});
