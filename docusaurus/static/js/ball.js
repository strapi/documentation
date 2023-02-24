import Particle from '/js/particle.js'
class Ball {
    constructor(ww, wh, bar) {
        this.ww = ww
        this.wh = wh
        this.x = ww / 2
        this.y = wh - 100
        this.radius = 10
        this.speed = 7
        this.speedMargin = 1
        this.dx = 0
        this.dy = 0
        this.bar = bar
        this.image = new Image()
        this.image.src = "/img/strapiicon.png"
        this.image.onload = () => {
            // set width and height of the image
            this.image.width = this.radius * 2
            this.image.height = this.radius * 2

            this.drawBall()
        }
    }
    render(ctx, game) {
        if (!game.active) {
            this.drawBall(ctx)
            return
        } else if (game.active && this.dx == 0 && this.dy == 0) {
            this.dx = this.speed
            this.dy = -this.speed
        }
        // this is the ball for the breakout game 
        // render the bar with physics and have it bounce around the screen
        // bounce off the sides of the screen
        if (this.x + this.dx > this.ww - this.radius || this.x + this.dx < this.radius) {
            this.dx = -this.dx;
        }
        // bounce off the top of the screen
        if (this.y + this.dy > this.wh - this.radius || this.y + this.dy < this.radius) {
            this.dy = -this.dy;
        }
        // bouce off the bar with some margin of error
        if (this.y + this.dy > this.wh - this.radius - 50 && this.x + this.dx > this.bar.x && this.x + this.dx < this.bar.x + this.bar.barWidth) {
            this.dy = -this.dy;
            // change dx based on where the ball hits the bar
            // if the ball hits the left side of the bar then dx should be negative
            // if the ball hits the right side of the bar then dx should be positive
            // if the ball hits the middle of the bar then dx should be 0
            let barCenter = this.bar.x + this.bar.barWidth / 2
            let ballCenter = this.x + this.radius
            let distanceFromCenter = barCenter - ballCenter
            // get distance from center as a percentage of the bar width from -1 to 1
            let distancePercentage = distanceFromCenter / this.bar.barWidth
            // dx should have a random speed within the speedMargin
            // get random number between -speedMargin and speedMargin
            let randomSpeed = Math.random() * this.speedMargin * 2 - this.speedMargin
            this.dx = -distancePercentage * this.speed + randomSpeed

        }

        // trigger game over if the ball goes below the bar
        if (this.y > this.wh - 25) {
            // game over
            // alert("GAME OVER");
            game.gameOver = true;
            game.active = false;
            // wait 5 seconds then destroy the game
            setTimeout(() => {
                game.destroy()
            }, 5000)
            console.log("game over")
        }
        let particles = Particle.particles
        // check if the ball hits a particle then bounce off of it and destroy the particle
        for (let i = 0; i < particles.length; i++) {
            let particle = particles[i]
            if (this.x + this.dx > particle.x - this.radius && this.x + this.dx < particle.x + this.radius && this.y + this.dy > particle.y - this.radius && this.y + this.dy < particle.y + this.radius) {
                // bounce off the particle in a random direction using the speed margin
                let randomSpeed = Math.random() * this.speedMargin * 2 - this.speedMargin
                this.dx = -this.dx + randomSpeed
                this.dy = -this.dy + randomSpeed


                particle.destroy()
            }


        }



        this.x += this.dx;
        this.y += this.dy;
        this.drawBall(ctx);

    }
    drawBall(ctx) {
        // center the image and shrink it to size of the ball
        ctx.drawImage(this.image, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2)
    }
}
export default Ball