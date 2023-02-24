class Game {
    static mouse = { x: 0, y: 0 }
    static leftPressed = false;
    static rightPressed = false;
    static mouseMoveEvents = 100;
    constructor(canvas, destroyCallback, setScoreCallback) {
        console.log("new game has been created")
        this.score = 0;
        this.canvas = canvas
        this.active = false;
        this.setScore = setScoreCallback
        this.gameOver = false;
        this.ctx = canvas.getContext("2d")
        this.destroyCallback = destroyCallback;

        window.addEventListener("keydown", (e) => {
            // set left and right press and if any of the valid keys are pressed reset the mouse move events
            if (e.code === "ArrowLeft" || e.code === "KeyA") {
                Game.leftPressed = true;
                Game.mouseMoveEvents = 0;
            }
            if (e.code === "ArrowRight" || e.code === "KeyD") {
                Game.rightPressed = true;
                Game.mouseMoveEvents = 0;
            }
        });
        window.addEventListener("keyup", (e) => {
            if (e.code === "ArrowLeft") {
                Game.leftPressed = false;
            }
            if (e.code === "ArrowRight") {
                Game.rightPressed = false;
            }
        });
    }
    increaseScore() {
        this.score++
        this.setScore(this.score)
    }
    start() {
        this.active = true;
        console.log("game has started")
    }
    destroy() {
        this.active = false;
        this.destroyCallback();
        console.log("game has been destroyed")
    }
    onMouseMove(e) {
        Game.mouse.x = e.clientX;
        Game.mouse.y = e.clientY;
        Game.mouseMoveEvents++;
    }
}
export default Game;