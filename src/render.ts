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
  ctx.fillStyle = "grey";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  renderOffsetedBackground(initBackground);
  state.creatures.forEach((creature) => renderCreature(creature, currentTime));
};

type GameBackground = {
  tiles: number[];
  width: number;
  height: number;
};

const createBackground = (
  width: number,
  height: number,
  tile: number,
): GameBackground => ({
  width,
  height,
  tiles: new Array(width * height).fill(tile),
});

const getTile = (
  background: GameBackground,
  position: { x: number; y: number },
) => {
  const tile = background.tiles[position.x + position.y * background.width];
  if (tile === undefined) throw new Error("incorrect position");
  return tile;
};

const mapTiles = (
  { width, height, tiles }: GameBackground,
  f: (value: number, position: { x: number; y: number }) => number,
) => ({
  width,
  height,
  tiles: tiles.map((value, index) =>
    f(value, { x: index % width, y: Math.floor(index / width) }),
  ),
});

const forEachTiles = (
  { width, height, tiles }: GameBackground,
  f: (value: number, position: { x: number; y: number }) => void,
) =>
  tiles.forEach((value, index) =>
    f(value, { x: index % width, y: Math.floor(index / width) }),
  );

const initBackground = createBackground(countColumns, countRow, 0);

const renderOffsetedBackground = (backgroung: GameBackground) => {
  const tempBiggerBackground = createBackground(
    backgroung.width + 1,
    backgroung.height + 1,
    0,
  );
  forEachTiles(tempBiggerBackground, (_, { x, y }) => {
    const tile = {
      NW: x === 0 || y === 0 ? 1 : getTile(backgroung, { x: x - 1, y: y - 1 }),
      NE:
        x === tempBiggerBackground.width - 1 || y === 0
          ? 1
          : getTile(backgroung, { x: x, y: y - 1 }),
      SW:
        x === 0 || y === tempBiggerBackground.height - 1
          ? 1
          : getTile(backgroung, { x: x - 1, y: y }),
      SE:
        x === tempBiggerBackground.width - 1 ||
        y === tempBiggerBackground.height - 1
          ? 1
          : getTile(backgroung, { x: x, y: y }),
    };
    renderBackgroundTile(tile, x, y);
  });
};

const backgroundTiles = new Image();
backgroundTiles.src = "./sprites/background/Grass_tiles_v2.png";

const renderBackgroundTile = (
  tile: { NW: number; NE: number; SW: number; SE: number },
  x: number,
  y: number,
) => {
  const imgWidth = 32;
  const imgHeight = 32;
  const canvasPosition = positionOnCanvas({ x, y });
  ctx.drawImage(
    backgroundTiles,
    0,
    0,
    imgWidth,
    imgHeight,
    canvasPosition.canvasX - imgWidth / 2,
    canvasPosition.canvasY - imgHeight / 2,
    cellWidth,
    cellHeight,
  );
};

// printMap(initBackground);
// const grassBorderBackground = addGrassBorder(initBackground);
// printMap(grassBorderBackground);

// const addGrassBorder = (map: GameBackground) => {
//   const newHeight = map.height + 2;
//   const newWidth = map.width + 2;

//   const newMap = createBackground(newWidth, newHeight, 0);

//   return mapTiles(newMap, (_, { x, y }) => {
//     if (x === 0 || x === newWidth - 1 || y === 0 || y === newHeight - 1)
//       return 1;

//     return getTile(map, { x: x - 1, y: y - 1 });
//   });
// };

// const printMap = (map: GameBackground) => {
//   for (let x = 0; x < map.width; x++) {
//     for (let y = 0; y < map.height; y++) {
//       process.stdout.write(getTile(map, { x, y }).toString());
//     }
//     process.stdout.write("\n");
//   }
// };
