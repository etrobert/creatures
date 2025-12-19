import { backgroundTilesPositions } from "./backgroundTilesPositions.js";
import { countColumns, countRow, type Creature, type State } from "./state.js";
import type { Direction, Position } from "./state.js";
import { tickDuration } from "./update.js";

const canvas = document.querySelector("canvas");
if (canvas === null) throw new Error("Could not get canvas");

const ctx = canvas.getContext("2d");
if (ctx === null) throw new Error("Could not get ctx");

const cellWidth = 32;
const cellHeight = 32;
canvas.width = cellWidth * countColumns;
canvas.height = cellHeight * countRow;

// translation bwtween grid position and canvas position
const positionOnCanvas = ({ x, y }: Position) => ({
  canvasX: x * cellWidth,
  canvasY: y * cellHeight,
});

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

const img = new Image();
const imgWidth = 40;
const imgHeight = 40;
const animationFrames = 6;
const frameDuration = tickDuration / animationFrames;
img.src = "./sprites/animations/bulbasaur/Walk-Anim.png";

const renderCreature = (creature: Creature, currentTime: number) => {
  const color = creature.player === 0 ? "blue" : "red";
  const canvasPosition = positionOnCanvas(creature.position);
  ctx.fillStyle = color;
  ctx.fillRect(
    canvasPosition.canvasX,
    canvasPosition.canvasY,
    cellWidth,
    cellHeight,
  );

  ctx.drawImage(
    img,
    (Math.floor(currentTime / frameDuration) % animationFrames) * imgWidth,
    getDirectionLine(creature.direction) * imgHeight,
    imgWidth,
    imgHeight,
    canvasPosition.canvasX - (imgWidth - cellWidth) / 2,
    canvasPosition.canvasY - (imgWidth - cellWidth) / 2,
    imgWidth,
    imgHeight,
  );
};

export const render = (state: State, currentTime: number) => {
  ctx.fillStyle = "lightskyblue";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  renderBackground(initBackground);
  state.creatures.forEach((creature) => renderCreature(creature, currentTime));
};

const getTile = (background: string[], position: { x: number; y: number }) => {
  const tile = background[position.x + position.y * countColumns];
  if (tile === undefined) throw new Error("incorrect position");
  return tile;
};

const initBackground = new Array(countColumns * countRow).fill("grass");

const renderBackground = (background: string[]) => {
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
            : getTile(background, { x: x, y: y - 1 }),
        SW:
          x === 0 || y === countRow - 1
            ? "void"
            : getTile(background, { x: x - 1, y: y }),
        SE:
          x === countColumns - 1 || y === countRow - 1
            ? "void"
            : getTile(background, { x: x, y: y }),
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
