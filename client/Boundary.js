class Boundary {
  static width = 40;

  static height = 40;

  constructor({ position }) {
    this.position = position;
    this.width = 40;
    this.height = 40;
  }

  draw(c) {
    // eslint-disable-next-line no-param-reassign
    c.fillStyle = 'green';
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

export default Boundary;
