import Boundary from './Boundary';

class Player {
  constructor({ startingPosition, color, id, name, isLocalPlayer }) {
    this.position = {
      x: Boundary.width * startingPosition.x + Boundary.width / 2,
      y: Boundary.height * startingPosition.y + Boundary.height / 2,
    };
    this.previousPosition = {
      x: this.position.x,
      y: this.position.y
    };
    this.velocity = { x: 0, y: 0 };
    this.hasPowerUp = false;
    this.color = color ?? 'gray';
    this.id = id;
    this.radius = 15;
    this.score = 0;
    this.name = name;
    this.isLocalPlayer = isLocalPlayer;
  }

  draw(c) {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.color;
    c.fill();

    if (!this.isLocalPlayer) {
      c.fillStyle = "rgba(255, 255, 255, 0.5)";
      const rectWidth = 60;
      const rectHeight = 20;
      const rectX = this.position.x - rectWidth / 2;
      const rectY = this.position.y - rectHeight * 2;
      c.fillRect(rectX, rectY, rectWidth, rectHeight);
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
    this.updatePrevious()
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  updateWithPosition(newPosition) {
    this.updatePrevious()
    this.position.x = newPosition.x;
    this.position.y = newPosition.y;
  }

  updatePrevious() {
    this.previousPosition.x = this.position.x;
    this.previousPosition.y = this.position.y;
  }

  updateAndDraw(c) {
    this.update();
    this.draw(c);
  }

  velocityIsLargerThanZero() {
    return this.velocity.x > 0
    && this.velocity.y > 0;
  }

  previousPositionIsSameAsCurrentPosition() {
    return this.previousPosition.x === this.position.x
      && this.previousPosition.y === this.position.y;
  }
}

export default Player;
