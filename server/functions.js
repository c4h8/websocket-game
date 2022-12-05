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

module.exports = { playerCollidesWithAnotherPlayer };