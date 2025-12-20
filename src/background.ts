import { backgroundTilesPositions } from "./backgroundTilesPositions.js";
import { countColumns, countRow, type Position } from "./state.js";

import { ctx } from "./render.js";

const getTile = (background: string[], position: { x: number; y: number }) => {
  const tile = background[position.x + position.y * countColumns];
  if (tile === undefined) throw new Error("incorrect position");
  return tile;
};

const getTile2 = (background: string[], position: { x: number; y: number }) => {
  const tile = background[position.x + position.y * countColumns * 2];
  if (tile === undefined) throw new Error("incorrect position");
  return tile;
};

export const initialBackground = new Array(countColumns * countRow).fill(
  "grass",
);

initialBackground[0] = "void";
initialBackground[1] = "void";
initialBackground[16] = "void";

export let twoCellsBackground = new Array();
for (let yn = 0; yn < countRow * 2; yn++) {
  for (let xn = 0; xn < countColumns * 2; xn++) {
    const x: number = Math.floor(xn / 2);
    const y: number = Math.floor(yn / 2);
    twoCellsBackground = [
      ...twoCellsBackground,
      getTile(initialBackground, { x, y }),
    ];
  }
}

export const renderBackground = (background: string[]) => {
  const moreRows = countRow * 2 + 1;
  const moreColumns = countColumns * 2 + 1;
  for (let y = 0; y < moreRows; y++) {
    for (let x = 0; x < moreColumns; x++) {
      const corners = {
        NW:
          x === 0 || y === 0
            ? "void"
            : getTile2(background, { x: x - 1, y: y - 1 }),
        NE:
          x === moreColumns - 1 || y === 0
            ? "void"
            : getTile2(background, { x, y: y - 1 }),
        SW:
          x === 0 || y === moreRows - 1
            ? "void"
            : getTile2(background, { x: x - 1, y }),
        SE:
          x === moreColumns - 1 || y === moreRows - 1
            ? "void"
            : getTile2(background, { x, y }),
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
    canvasPosition.canvasX + imgWidth / 2,
    canvasPosition.canvasY + imgHeight / 2,
    imgWidth,
    imgHeight,
  );
  ctx.strokeRect(
    canvasPosition.canvasX + imgWidth / 2,
    canvasPosition.canvasY + imgHeight / 2,
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
