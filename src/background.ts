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

export let twoCellsBackground = new Array(countColumns * countRow * 4).fill(
  "grass",
);
for (let xn = 0; xn < countColumns * 2; xn++) {
  for (let yn = 0; yn < countRow * 2; yn++) {
    const x: number = Math.floor(xn / 2);
    const y: number = Math.floor(yn / 2);
    twoCellsBackground = [
      ...twoCellsBackground,
      getTile(initialBackground, { x, y }),
    ];
  }
}

export const renderBackground = (background: string[]) => {
  for (let x = 0; x < countColumns * 2; x++) {
    for (let y = 0; y < countRow * 2; y++) {
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
  const imgWidth = 16;
  const imgHeight = 16;
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

const tileWidth = 16;
const tileHeight = 16;

// translation bwtween grid position and canvas position
const positionOnCanvas = ({ x, y }: Position) => ({
  canvasX: x * tileWidth,
  canvasY: y * tileHeight,
});
