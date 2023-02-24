import Game from "/js/game.js";
class Bar {
    constructor(ww, wh) {
        this.ww = ww;
        this.wh = wh;
        this.name = "bar";
        this.bottomOffset = 50
        this.barWidth = 100
        this.barHeight = 10
    }
    render(ctx, wh) {
        this.x = Game.mouse.x;
        this.y = Game.mouse.y;

        // preven bar from going out of bounds
        if (this.x < this.barWidth / 2) {
            this.x = this.barWidth / 2;
        }
        if (this.x > this.ww - this.barWidth / 2) {
            this.x = this.ww - this.barWidth / 2;
        }


        ctx.beginPath();
        ctx.rect(this.x - this.barWidth / 2, this.wh - this.bottomOffset, this.barWidth, this.barHeight);
        ctx.fillStyle = "#7B79FF";
        ctx.fill();
        ctx.closePath();




    }
}
export default Bar;