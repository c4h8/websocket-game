class Coin {
  constructor({ position }) {
    this.position = position;
    this.radius = 5;
  }

  draw(c) {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    // eslint-disable-next-line no-param-reassign
    c.fillStyle = 'yellow';
    c.fill();
    c.closePath();
  }
}

export default Coin;
