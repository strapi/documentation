class Game {
  static mouse = { x: 0, y: 0 };
  static leftPressed = false;
  static rightPressed = false;
  static mouseMoveEvents = 100;
  constructor(canvas, destroyCallback, setScoreCallback) {
    this.score = 0;
    this.canvas = canvas;
    this.active = false;
    this.setScore = setScoreCallback;
    this.gameOver = false;
    this.ctx = canvas.getContext("2d");
    this.destroyCallback = destroyCallback;
    let leftKeys = ["ArrowLeft", "KeyA"];
    let rightKeys = ["ArrowRight", "KeyD"];
    window.addEventListener("keydown", (e) => {
      // set left and right press and if any of the valid keys are pressed reset the mouse move events
      if (leftKeys.includes(e.code)) {
        Game.leftPressed = true;
        Game.mouseMoveEvents = 0;
      }
      if (rightKeys.includes(e.code)) {
        Game.rightPressed = true;
        Game.mouseMoveEvents = 0;
      }
    });
    window.addEventListener("keyup", (e) => {
      if (leftKeys.includes(e.code)) {
        Game.leftPressed = false;
      }
      if (rightKeys.includes(e.code)) {
        Game.rightPressed = false;
      }
    });
  }
  increaseScore() {
    this.score++;
    this.setScore(this.score);
  }
  start() {
    this.active = true;
    this.gameOver = false;
    console.log("game has started");
  }
  destroy() {
    this.active = false;
    this.destroyCallback();
    console.log("game has been destroyed");
  }
  onMouseMove(e) {
    Game.mouse.x = e.clientX;
    Game.mouse.y = e.clientY;
    Game.mouseMoveEvents++;
  }
}
export default Game;
