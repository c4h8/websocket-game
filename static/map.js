const tileSize = 24;
const [mapX, mapY] = [10, 10];

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

const assetSlugs = ["g1"];

const loadAssets = async (assetList) => {
  // loading images is asynchoronous so promise map
  const assets = await Promise.all(
    assetList.map((name) => {
      const img = new Image(tileSize, tileSize);
      // assets.push(img);
      return new Promise(
        (ret) => (img.onload = ret),
        (img.src = `/static/${name}.png`)
      ).then((res) => res);
    })
  );

  return assets.map((a) => a.target);
};

const insertGame = async (target) => {
  const assets = await loadAssets(assetSlugs);
  const ctx = document.getElementById(target).getContext("2d");

  // render tile map
  for (y = 0; y < mapY; y++) {
    for (x = 0; x < mapX; x++) {
      ctx.drawImage(assets[0], tileSize * x, tileSize * y);
    }
  }
};

// inserts the game to the document when the DOM is ready
document.addEventListener("DOMContentLoaded", (e) => {
  insertGame("game");
});
