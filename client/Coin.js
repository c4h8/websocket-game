import Boundary from './Boundary';

class Coin {
  constructor({ gridPosition }) {
    this.gridPosition = gridPosition;
    this.position = {
      x: Boundary.width * gridPosition.x + Boundary.width / 2,
      y: Boundary.height * gridPosition.y + Boundary.height / 2,
    },
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
