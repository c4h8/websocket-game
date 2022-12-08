let number = 1;

class Player {
  static size = 40;

  constructor({
    startingPosition, id,
  }) {
    this.position = {
      x: this.size * startingPosition.x + this.size / 2,
      y: this.size * startingPosition.y + this.size / 2,
    };
    this.id = id;
    this.velocity = { x: 0, y: 0 };
    this.score = 0;
    this.startingPosition = startingPosition;
    this.name = `Player${number}`;
    this.radius = 18;
    this.hasPowerUp = false;
    this.color = 'red'

    number++;
  }
}

module.exports = Player;
