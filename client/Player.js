class Player {
  constructor({ position, color, id }) {
    this.position = position;
    this.velocity = { x: 0, y: 0};
    this.color = color;
    this.id = id;
    this.radius = 15;
    this.score = 0;
  }

  draw(c) {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    // eslint-disable-next-line no-param-reassign
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
  }

  update(c) {
    this.draw(c);
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

export default Player;
