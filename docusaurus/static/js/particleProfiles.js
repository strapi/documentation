// Path: docusaurus\static\js\app.js
import Particle from "/js/particle.js";
import Game from "/js/game.js";
import Bar from "/js/bar.js";
import Ball from "/js/ball.js";
async function strapiParticles() {
    let profiles = Particle.profiles;
    if (
        localStorage.getItem("profiles") &&
        localStorage.getItem("profilesLastUpdated") &&
        Date.now() - localStorage.getItem("profilesLastUpdated") <
        1000 * 60 * 60 * 24 * 7
    ) {
        // load profiles from local storage
        profiles.push(...JSON.parse(localStorage.getItem("profiles")));
        console.log("loaded profiles from local storage");
    } else {
        // fetch all the profiles from github on all the pages
        let page = 1;
        while (true) {
            let res;
            try {
                res = await fetch(
                    "https://api.github.com/repos/strapi/strapi/contributors?per_page=100&page=" +
                    page
                );
            } catch (e) {
                console.log(e);
                break;
            }
            const data = await res.json();
            if (data.length == 0) {
                localStorage.setItem("profiles", JSON.stringify(profiles));
                localStorage.setItem("profilesLastUpdated", Date.now());
                break;
            }
            page++;
            data.forEach((profile) => {
                if (profile.avatar_url) profiles.push(profile.avatar_url);
            });
        }
    }
    // create canvas element and append to body
    const bodycanvas = document.createElement("canvas");
    bodycanvas.id = "scene";
    document.body.appendChild(bodycanvas);
    // init game
    Particle.particles = [];
    Particle.amount = 0;
    Particle.radius = 1;
    const game = new Game(document.querySelector("#scene"), destroy);
    Particle.game = game;
    const ctx = game.ctx;
    const canvas = game.canvas;
    let bar = null;
    let ball = null;

    // delete canvas if user hits escape
    document.addEventListener("keydown", function (event) {
        if (event.code === "Escape") {
            bodycanvas.remove();
            game.destroy();
        }
    });
    let ww = (canvas.width = window.innerWidth);
    let wh = (canvas.height = window.innerHeight);

    function initScene() {
        ww = canvas.width = window.innerWidth;
        wh = canvas.height = window.innerHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Create an image object and load the image file
        const img = new Image();
        img.src = "/img/strapi.png";

        // Once the image is loaded, draw it on the canvas
        img.onload = function () {
            const aspectRatio = img.width / img.height;
            const padding = 300;
            const newWidth = ww - padding;
            const newHeight = newWidth / aspectRatio;
            // center the image
            ctx.drawImage(
                img,
                padding / 2,
                (wh - img.height) / 2,
                newWidth,
                newHeight
            );

            // Get the image data and create particles
            const data = ctx.getImageData(0, 0, ww, wh).data;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = "source-over";

            Particle.particles = [];
            for (let i = 0; i < ww; i += Math.round(ww / 80)) {
                for (let j = 0; j < wh; j += Math.round(ww / 80)) {
                    if (data[(i + j * ww) * 4 + 3] > 80) {
                        Particle.particles.push(new Particle(i, j, ww, wh));
                    }
                }
            }
            bar = new Bar(ww, wh);
            ball = new Ball(ww, wh, bar);


            Particle.amount = Particle.particles.length;
        };
    }

    function onMouseClick() {
        Particle.radius++;
        if (Particle.radius === 5) {
            Particle.radius = 0;
        }
    }

    function render(a) {
        if(!game) return;
        requestAnimationFrame(render);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < Particle.amount; i++) {
            Particle.particles[i].render(ctx, game.active, game.gameOver);
        }
        bar?.render(ctx, game);
        ball?.render(ctx, game);
    }
    function destroy() {
        bar = null;
        ball = null;
        game = null;
        bodycanvas.remove();
    }
    function startGame() {
        game.start();
    }
    window.addEventListener("resize", initScene);
    window.addEventListener("mousemove", game.onMouseMove);
    window.addEventListener("click", onMouseClick);
    window.addEventListener("keydown", (e) => {
        if (e.code === "Enter") {
            startGame();
        }
    });
    initScene();
    requestAnimationFrame(render);
}
const konamiCode = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "KeyB",
    "KeyA",
];
const pressed = [];
window.addEventListener("keydown", (e) => {
    pressed.push(e.code);
    pressed.splice(-konamiCode.length - 1, pressed.length - konamiCode.length);
    if (pressed.join("").includes(konamiCode.join(""))) {
        strapiParticles();
    }
});
