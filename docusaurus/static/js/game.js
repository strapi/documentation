class Game {
    static mouse = { x: 0, y: 0 }
    constructor(canvas, destroyCallback) {
        console.log("new game has been created")
        this.canvas = canvas
        this.active = false;
        this.gameOver = false;
        this.ctx = canvas.getContext("2d")
        this.destroyCallback = destroyCallback;
    }
    start(){
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
    }
}
export default Game;