import Boundary from './Boundary';

class Player {
  constructor({ startingPosition, color, id }) {
    this.position = {
      x: Boundary.width * startingPosition.x + Boundary.width / 2,
      y: Boundary.height * startingPosition.y + Boundary.height / 2,
    };
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
