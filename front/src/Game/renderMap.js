import g1 from "./assets/g1.png";
import b1 from "./assets/b1.png";

const tileSize = 24;
const [mapX, mapY] = [10, 10];

const tiles = [g1, b1].map((src) => {
  const img = new Image(tileSize, tileSize);
  img.src = src;
  return img;
});

const tileMap = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];
console.log("b1", b1);

const renderMap = (ctx) => {
  for (let y = 0; y < mapY; y++) {
    for (let x = 0; x < mapX; x++) {
      ctx.drawImage(tiles[tileMap[y][x]], tileSize * x, tileSize * y);
    }
  }
};

export default renderMap;
