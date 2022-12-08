import Boundary from './Boundary';

class Player {
  constructor({ startingPosition, color, id, name }) {
    this.position = {
      x: Boundary.width * startingPosition.x + Boundary.width / 2,
      y: Boundary.height * startingPosition.y + Boundary.height / 2,
    };
    this.velocity = { x: 0, y: 0 };
    this.hasPowerUp = false;
    this.color = color ?? 'gray';
    this.id = id;
    this.radius = 15;
    this.score = 0;
    this.name = name;
    this.updated = false;
  }

  draw(c) {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.color;
    c.fill();

    if (this.color === 'gray') {
      c.fillStyle = "rgba(255, 255, 255, 0.5)";
      const rectWidth = 60;
      const rectHeight = 15;
      const rectX = this.position.x - rectWidth / 2;
      const rectY = this.position.y - rectHeight * 2.5;
      c.fillRect(rectX, rectY, rectWidth, 15);
      c.font = "14px Arial";
      c.textAlign = "center"; 
      c.textBaseline = "middle";
      c.fillStyle = "black";
      c.fillText(
        this.name,
        rectX + rectWidth / 2,
        rectY + rectHeight / 2
      );
      c.stroke();
      c.closePath();
    }
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  drawAndupdate(c) {
    this.update();
    this.draw(c);
  }
}

export default Player;
