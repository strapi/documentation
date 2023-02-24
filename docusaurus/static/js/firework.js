class Firework {
  static fireworks = [];
  constructor(x, y, size, color) {
    this.x = x; // x coordinate of firework launch position
    this.y = y; // y coordinate of firework launch position
    this.size = size; // size of firework explosion
    this.color = color; // color of firework explosion
    this.velX = Math.random() * 5 - 2.5; // x velocity of firework explosion
    this.velY = Math.random() * 5 - 11; // y velocity of firework explosion
    this.gravity = 0.1; // gravity acting on the firework explosion
    this.opacity = 1; // opacity of the firework explosion
    this.isExploded = false; // whether the firework has exploded
  }

  update(ctx) {
    if (!this.isExploded) {
      // Update the firework's position based on its velocity
      this.x += this.velX;
      this.y += this.velY;

      // Apply gravity to the firework's velocity
      this.velY += this.gravity;

      // Check if the firework has reached its maximum height
      if (this.velY >= 0) {
        this.isExploded = true;
        this.explode(ctx);
      }
    } else {
      // Update the opacity of the firework explosion
      this.opacity -= 0.02;

      // Check if the firework explosion has faded out completely
      if (this.opacity <= 0) {
        this.opacity = 0;
      }
    }
  }

  isFinished() {
    return this.isExploded && this.opacity <= 0;
  }

  explode(ctx) {
    // Create multiple lines extending from the explosion to simulate fireworks
    for (let i = 0; i < 100; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const length = Math.random() * this.size * 2;
      const x2 = this.x + length * Math.cos(angle);
      const y2 = this.y + length * Math.sin(angle);
      const lineWidth = Math.random() * 5;
      const alpha = Math.random() * 0.5 + 0.5;
      this.renderLine(x2, y2, lineWidth, alpha, ctx);
    }
  }

  renderLine(x2, y2, lineWidth, alpha, ctx) {
    // Save the canvas context's current state
    ctx.save();

    // Set the stroke style to the firework's color and opacity
    ctx.strokeStyle = `rgba(${this.color}, ${alpha})`;

    // Set the line width and cap style
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";

    // Create a line from the firework's launch position to the given point
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Restore the canvas context's original state
    ctx.restore();
  }

  render(ctx) {
    if (!this.isExploded) {
      // Render the firework as a circle
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
      ctx.fill();
    }
  }
}
export default Firework;
