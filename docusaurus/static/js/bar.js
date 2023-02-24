import Game from "/js/game.js";
class Bar {
  constructor(ww, wh) {
    this.ww = ww;
    this.wh = wh;
    this.x = ww / 2;
    this.name = "bar";
    this.bottomOffset = 100;
    this.barWidth = 200;
    this.barHeight = 10;
    this.movementSpeed = 10;
  }
  render(ctx) {
    // check if left or right arrow is pressed
    if (Game.leftPressed) {
      this.x -= this.movementSpeed;
    }
    if (Game.rightPressed) {
      this.x += this.movementSpeed;
    }
    if (Game.mouseMoveEvents > 100) {
      this.x = Game.mouse.x - this.barWidth / 2;
    }
    this.y = this.wh - this.bottomOffset;

    // preven bar from going out of bounds
    if (this.x < 0) {
      this.x = 0;
    }
    if (this.x + this.barWidth > this.ww) {
      this.x = this.ww - this.barWidth;
    }

    ctx.beginPath();
    ctx.rect(this.x, this.y, this.barWidth, this.barHeight);
    ctx.fillStyle = "#7B79FF";
    ctx.fill();
    ctx.closePath();
  }
}
export default Bar;
