const Player = require('./Player');

class PowerUp {
  constructor({ gridPosition }) {
    this.gridPosition = gridPosition;
    this.position = {
      x: Player.size * gridPosition.x + Player.size / 2,
      y: Player.size * gridPosition.y + Player.size / 2,
    },
    this.radius = 10;
  }
}

module.exports = PowerUp;
