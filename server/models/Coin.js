const Player = require('./Player');

class Coin {
  constructor({ gridPosition }) {
    this.gridPosition = gridPosition;
    this.position = {
      x: Player.size * gridPosition.x + Player.size / 2,
      y: Player.size * gridPosition.y + Player.size / 2,
    },
    this.radius = 5;
  }
}

module.exports = Coin;