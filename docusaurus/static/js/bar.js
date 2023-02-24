import Game from "/js/game.js";
class Bar {
  constructor(ww, wh) {
    this.ww = ww;
    this.wh = wh;
    this.x = ww / 2;
    this.name = "bar";
    this.color = "#7B79FF";
    this.bottomOffset = 100;
    this.barWidth = 200;
    this.barHeight = 10;
    this.movementSpeed = 10;
    this.month = new Date().getMonth()
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
    // fill the rectangle with a rainbow gradient
    // check if month is june
    if (this.month === 5) {
      let gradient = ctx.createLinearGradient(
        this.x,
        0,
        this.x + this.barWidth,
        0
      );
      gradient.addColorStop("0", "magenta");
      gradient.addColorStop("0.15", "blue");
      gradient.addColorStop("0.33", "green");
      gradient.addColorStop("0.5", "yellow");
      gradient.addColorStop("0.67", "orange");
      gradient.addColorStop("0.85", "red");
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = this.color;
    }

    ctx.fill();
    ctx.closePath();
  }
}
export default Bar;
