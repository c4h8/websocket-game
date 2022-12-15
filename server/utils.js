const initialMap = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

let startingPositionsArray = [];
for (let i = 0; i < initialMap.length; i++) {
  for (let j = 0; j < initialMap[0].length; j++) {
    if (initialMap[i][j] === 0) {
      startingPositionsArray = [...startingPositionsArray, { x: j, y: i }]
    }
  }
}

function playerCollidesWithAnotherPlayer(
  player,
  anotherPlayer,
) {
  const collision = player.position.x + 2 * player.radius + player.velocity.x >= anotherPlayer.position.x
    && player.position.x - 2 * player.radius + player.velocity.x <= anotherPlayer.position.x
    && player.position.y - 2 * player.radius + player.velocity.y <= anotherPlayer.position.y
    && player.position.y + 2 * player.radius + player.velocity.y >= anotherPlayer.position.y;
  
  if (player.velocity.x !== 0 && collision && (Math.abs(player.position.y - anotherPlayer.position.y) < Math.abs(player.position.x - anotherPlayer.position.x))) {
    if (player.position.x > anotherPlayer.position.x) {
      player.velocity.x = Math.abs(player.velocity.x);
    } else {
      player.velocity.x = -Math.abs(player.velocity.x);
    }
    return true;
  }

  if (player.velocity.y !== 0 && collision && (Math.abs(player.position.y - anotherPlayer.position.y) > Math.abs(player.position.x - anotherPlayer.position.x))) {
    if (player.position.y > anotherPlayer.position.y) {
      player.velocity.y = Math.abs(player.velocity.y);
    } else {
      player.velocity.y = -Math.abs(player.velocity.y);
    }
    return true;
  }
  
  return false;
}

const getRandomEmptyGridPosition = (map) => {
  const emptyPositions = map.map(
    (row, rowIndex) => row.map((number, column) => ({ x: column, y: rowIndex, number })),
  )
    .flat()
    .filter((element) => element.number === 0);

  const randomEmptyPositionIndex = Math.floor(Math.random() * emptyPositions.length)

  return emptyPositions[randomEmptyPositionIndex]
}

module.exports = { startingPositionsArray, initialMap, playerCollidesWithAnotherPlayer, getRandomEmptyGridPosition };