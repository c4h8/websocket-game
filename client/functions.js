import Boundary from './classes/Boundary';
import Coin from './classes/Coin';
import PowerUp from './classes/PowerUp';

export function createMap(map, boundaries, coins) {
  let powerUp = null;

  map.forEach((row, i) => row.forEach((symbol, j) => {
    switch (symbol) {
      case 1:
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
          }),
        );
        break;
      case 2:
        coins.push(
          new Coin({
            gridPosition: {
              x: j,
              y: i,
            }
          }),
        );
        break;
      case 3:
        powerUp = new PowerUp({
          gridPosition: {
            x: j,
            y: i,
          }
        });
        break;
      default:
        break;
    }
  }));

  return powerUp;
}

export function playerCollidesWithBoundary({
  player,
  boundary,
}) {
  return (
    player.position.y - player.radius + player.velocity.y <= boundary.position.y + boundary.height
      && player.position.x + player.radius + player.velocity.x >= boundary.position.x
      && player.position.y + player.radius + player.velocity.y >= boundary.position.y
      && player.position.x - player.radius + player.velocity.x
      <= boundary.position.x + boundary.width
  );
}

export function playerCollidesWithAnotherPlayer({
  player,
  anotherPlayer,
}) {
  const collision = player.position.x + 2 * player.radius + player.velocity.x >= anotherPlayer.position.x
    && player.position.x - 2 * player.radius + player.velocity.x <= anotherPlayer.position.x
    && player.position.y - 2 * player.radius + player.velocity.y <= anotherPlayer.position.y
    && player.position.y + 2 * player.radius + player.velocity.y >= anotherPlayer.position.y;
  
  if (player.velocity.x !== 0 && collision && (Math.abs(player.position.y - anotherPlayer.position.y) < Math.abs(player.position.x - anotherPlayer.position.x))) {
    return true;
  }

  if (player.velocity.y !== 0 && collision && (Math.abs(player.position.y - anotherPlayer.position.y) > Math.abs(player.position.x - anotherPlayer.position.x))) {
    return true;
  }
  
  return false;
}