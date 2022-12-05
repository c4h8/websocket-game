const startingPositionsArray = [
  { x: 1, y: 1 },
  { x: 1, y: 9 },
  { x: 17, y: 1 },
  { x: 17, y: 9 },
  { x: 9, y: 1 },
  { x: 9, y: 9 },
  { x: 5, y: 5 },
  { x: 12, y: 5 },
  { x: 3, y: 3 },
  { x: 15, y: 3 },
  { x: 3, y: 7 },
  { x: 15, y: 7 },
  { x: 7, y: 3 },
  { x: 13, y: 3 },
  { x: 7, y: 7 },
  { x: 13, y: 7 },
];

const map = [
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

const getRandomEmptyGridPosition = () => {
  const emptyPositions = map.map(
    (row, rowIndex) => row.map((number, column) => ({ x: column, y: rowIndex, number })),
  )
    .flat()
    .filter((element) => element.number === 0);

  const randomEmptyPositionIndex = Math.floor(Math.random() * emptyPositions.length)

  return emptyPositions[randomEmptyPositionIndex]
}

module.exports = { startingPositionsArray, map, playerCollidesWithAnotherPlayer, getRandomEmptyGridPosition };