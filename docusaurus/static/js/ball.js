import Particle from "/js/particle.js";
class Ball {
  constructor(ww, wh, bar) {
    this.ww = ww;
    this.wh = wh;
    this.x = ww / 2;
    this.y = wh - (bar.bottomOffset + 100);
    this.radius = 12;
    this.speed = 8;
    if (navigator?.platform?.toUpperCase().indexOf("MAC") >= 0) {
      this.speed = 12;
    }
    this.speedMargin = 2;
    this.dx = 0;
    this.dy = 0;
    this.bar = bar;
    this.image = new Image();
    this.image.src = "/img/strapiicon.png";
    this.image.onload = () => {
      // set width and height of the image
      this.image.width = this.radius * 2;
      this.image.height = this.radius * 2;

      this.drawBall();
    };
  }
  render(ctx, game) {
    if (!game.active) {
      this.drawBall(ctx);
      return;
    } else if (game.active && this.dx == 0 && this.dy == 0) {
      this.dx = this.speed;
      this.dy = -this.speed;
    }
    // bounce off the sides of the screen
    if (
      this.x + this.dx > this.ww - this.radius ||
      this.x + this.dx < this.radius
    ) {
      this.dx = -this.dx;
    }
    // bounce off the top of the screen
    if (
      this.y + this.dy > this.wh - this.radius ||
      this.y + this.dy < this.radius
    ) {
      this.dy = -this.dy;
    }
    // bouce off the bar with some margin of error

    if (
      this.y < this.bar.y && // ball previous frame is above the bar
      this.y + this.dy > this.bar.y && // ball next frame is below the bar
      this.x > this.bar.x - this.radius &&
      this.x < this.bar.x + this.bar.barWidth + this.radius
    ) {
      this.dy = -this.dy;
      let barCenter = this.bar.x + this.bar.barWidth / 2;
      let ballCenter = this.x + this.radius;
      let distanceFromCenter = barCenter - ballCenter;
      // get distance from center as a percentage of the bar width from -1 to 1
      let distanceFromCenterPercentage =
        distanceFromCenter / (this.bar.barWidth / 2);

      // dx should have a random speed within the speedMargin
      // get random number between -speedMargin and speedMargin
      let randomSpeed = Math.random() * this.speedMargin * 2 - this.speedMargin;
      this.dx =
        this.speed * Math.min(-distanceFromCenterPercentage, 0.5) + randomSpeed;
    }

    // trigger game over if the ball goes below the bar
    if (this.y > this.wh - 25) {
      game.gameOver = true;
      game.active = false;
    }
    let particles = Particle.particles;
    // check if the ball hits a particle then bounce off of it and destroy the particle
    for (let i = 0; i < particles.length; i++) {
      let particle = particles[i];
      if (
        this.x + this.dx > particle.x - this.radius &&
        this.x + this.dx < particle.x + this.radius &&
        this.y + this.dy > particle.y - this.radius &&
        this.y + this.dy < particle.y + this.radius
      ) {
        // bounce off the particle in a random direction using the speed margin
        let randomSpeed =
          Math.random() * this.speedMargin * 2 - this.speedMargin;
        this.dx = -this.dx + randomSpeed;
        this.dy = -this.dy + randomSpeed;

        particle.destroy();
        // if there are no more particles then the game is over
        if (Particle.particles.length === 0) {
          game.gameOver = true;
          game.active = false;
        }
      }
    }

    this.x += this.dx;
    this.y += this.dy;
    this.drawBall(ctx);
  }
  drawBall(ctx) {
    // center the image and shrink it to size of the ball
    ctx.drawImage(
      this.image,
      this.x - this.radius,
      this.y - this.radius,
      this.radius * 2,
      this.radius * 2
    );
  }
}
export default Ball;
