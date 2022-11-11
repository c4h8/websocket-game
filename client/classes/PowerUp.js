import Boundary from './Boundary';

class PowerUp {
  constructor({ gridPosition }) {
    this.gridPosition = gridPosition;
    this.position = {
      x: Boundary.width * gridPosition.x + Boundary.width / 2,
      y: Boundary.height * gridPosition.y + Boundary.height / 2,
    },
    this.radius = 10;
  }

  draw(c) {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    // eslint-disable-next-line no-param-reassign
    c.fillStyle = 'blue';
    c.fill();
    c.closePath();
  }
}

export default PowerUp;