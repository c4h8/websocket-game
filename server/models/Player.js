class Player {
  static size = 40;

  constructor({
    startingPosition, color, id,
  }) {
    this.position = {
      x: this.size * startingPosition.x + this.size / 2,
      y: this.size * startingPosition.y + this.size / 2,
    };
    this.color = color;
    this.id = id;
    this.velocity = { x: 0, y: 0 };
    this.score = 0;
    this.startingPosition = startingPosition;
  }
}

module.exports = Player;
