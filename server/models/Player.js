class Player {
  constructor({
    position, color, id,
  }) {
    this.position = position;
    this.color = color;
    this.id = id;
    this.velocity = 0;
    this.score = 0;
    this.startingPosition = position;
  }
}

module.exports = Player;
