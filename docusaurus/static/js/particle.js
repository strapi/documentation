// make and export particle class
import Game from '/js/game.js'
class Particle {
    static profileIndex = 0
    static profiles = []
    static particles = []
    static amount = 0
    static radius = 1
    static game = null
    constructor(x, y, ww, wh) {
        this.x = Math.random() * ww;
        this.y = Math.random() * wh;
        this.dest = {
            x: x,
            y: y
        };
        this.ogr = Math.random() * 5 + 10;
        this.r = this.ogr
        this.vx = (Math.random() - 0.5) * 20;
        this.vy = (Math.random() - 0.5) * 20;
        this.accX = 0;
        this.accY = 0;
        this.friction = Math.random() * 0.002 + 0.94;

        // this.color = colors[Math.floor(Math.random()*6)];
        this.image = new Image();
        if (Particle.profileIndex >= Particle.profiles.length) Particle.profileIndex = 0;
        this.image.src = Particle.profiles[Particle.profileIndex++];
    }
    destroy() {
        Particle.particles.splice(Particle.particles.indexOf(this), 1)
        Particle.amount--
    }
    render(ctx, gameActive, gameOver) {
        if (gameOver) {
            this.dest.y = 1000
        }
        this.accX = (this.dest.x - this.x) / 100;
        this.accY = (this.dest.y - this.y) / 100;
        this.vx += this.accX;
        this.vy += this.accY;
        this.vx *= this.friction;
        this.vy *= this.friction;
        //TODO: only lock if breakout mode is on
        // if (!gameActive) {
        this.x += this.vx;
        this.y += this.vy;
        // } else {
        //     this.x = this.dest.x;
        //     this.y = this.dest.y;
        // }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, Math.PI * 2, false);
        ctx.fill();

        ctx.globalAlpha = 1;
        // clip image to circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(this.image, this.x - this.r, this.y - this.r, this.r * 2, this.r * 2);
        ctx.restore();
        ctx.fillStyle = "#000"



        if (!gameActive) {

            const a = this.x - Game.mouse.x;
            const b = this.y - Game.mouse.y;

            const distance = Math.sqrt(a * a + b * b);
            if (distance < (Particle.radius * 70)) {
                this.accX = (this.x - Game.mouse.x) / 100;
                this.accY = (this.y - Game.mouse.y) / 100;
                this.vx += this.accX;
                this.vy += this.accY;


            }
        }
    }
}

export default Particle;


