// Credits:
// Particles inspired by https://codepen.io/Mamboleoo/pen/obWGYr
// Breakout inspired by https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript
import Particle from "/js/particle.js";
import Game from "/js/game.js";
import Bar from "/js/bar.js";
import Ball from "/js/ball.js";
import Firework from "/js/firework.js";

let game = null;
let bar = null;
let ball = null;
let rendering = { value: true };
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
  Particle.radius = 1;
  game = new Game(document.querySelector("#scene"), destroy, setScore);
  printConsoleInstructions();
  window.game = game;
  const ctx = game.ctx;
  const canvas = game.canvas;
  let ww = (canvas.width = window.innerWidth);
  let wh = (canvas.height = window.innerHeight);

  function setScore(score) {
    document.getElementById("breakout-score").innerText = "Score: " + score;
  }
  let titleInterval;
  function initScene() {
    ww = canvas.width = window.innerWidth;
    wh = canvas.height = window.innerHeight;

    //add score to the navbar by adding a span with the class name navbar__item and id breakout-score
    const score = document.createElement("span");
    score.className = "navbar__item navbar__link";
    score.id = "breakout-score";
    score.innerText = "Score: 0";
    function setupDom() {
      document.querySelector(".navbar__items").appendChild(score);
      // change all h1 tags to say "Strapi Breakout - Press Enter To Start"
      document.querySelectorAll("h1").forEach((h1) => {
        // store the original text in the data-original-text attribute
        h1.setAttribute("data-original-text", h1.innerText);
        h1.innerText = "Strapi Breakout";
        // add smaller instructions below in an h2
        const h2 = document.createElement("h2");
        h2.innerText = "Press Enter to Start \n Press Esc to Exit";
        h1.parentNode.insertBefore(h2, h1.nextSibling);
      });
      //store the original title in the data-original-title attribute
      document.ogTitle = document.title;
      // animate document title with a marquee saying "Strapi Breakout" with padding
      document.title = `Strapi Breakout - Press Enter to Start - Press Esc to Exit- `;
      // animate title
      let title = document.title;
      let titleLength = title.length;
      let titleIndex = 0;
      titleInterval = setInterval(() => {
        titleIndex++;
        if (titleIndex > titleLength) {
          titleIndex = 0;
        }
        document.title = title.slice(titleIndex) + title.slice(0, titleIndex);
      }, 200);

      // set scroll to top
      window.scrollTo(0, 0);
    }
    // if window is loaded just add if not wait for onload
    if (document.readyState === "complete") {
      setupDom();
    } else {
      window.addEventListener("load", setupDom);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // reset profile index to maintain order of profiles.
    Particle.profileIndex = 0;

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
            Particle.particles.push(new Particle(i, j, ww, wh, game));
          }
        }
      }
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * ww;
        const y = Math.random() * wh;
        const size = Math.random() * 25 + 10;
        const color = `${Math.floor(Math.random() * 256)},${Math.floor(
          Math.random() * 256
        )},${Math.floor(Math.random() * 256)}`;
        Firework.fireworks.push(new Firework(x, y, size, color));
      }
      bar = new Bar(ww, wh);
      ball = new Ball(ww, wh, bar);
      window.bar = bar;
      window.ball = ball;
    };
  }

  function onMouseClick() {
    Particle.radius++;
    if (Particle.radius === 5) {
      Particle.radius = 0;
    }
  }

  let then = Date.now();
  const fps = 60;
  const interval = 1000 / fps;

  function render(a) {
    // console.log(rendering)
    if (!game) return;
    // cap the framerate to 60fps
    const now = Date.now();
    const delta = now - then;
    if (delta < interval || !rendering.value) {
      requestAnimationFrame(render);
      return;
    }
    then = now - (delta % interval);
    requestAnimationFrame(render);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < Particle.particles.length; i++) {
      Particle.particles[i].render(ctx, game.active, game.gameOver);
    }
    bar?.render(ctx);
    ball?.render(ctx, game);
    if (game.gameOver && Particle.particles.length === 0) {
      for (let i = 0; i < Firework.fireworks.length; i++) {
        Firework.fireworks[i].update(ctx);
        Firework.fireworks[i].render(ctx);

        // Remove the firework from the array if it has finished exploding
        if (Firework.fireworks[i].isFinished()) {
          Firework.fireworks.splice(i, 1);
          i--;
        }
      }
      ctx.font = "bold 50px Segoe UI";
      ctx.fillStyle = "#7B79FF";
      ctx.textAlign = "center";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 5;

      ctx.strokeText("You Win", ww / 2, wh / 2);

      ctx.fillText("You Win", ww / 2, wh / 2);

      // write score on the screen
      ctx.font = "bold 30px Segoe UI";

      ctx.strokeText(`Score: ${game.score}`, ww / 2, wh / 2 + 50);
      ctx.fillText(`Score: ${game.score}`, ww / 2, wh / 2 + 50);
    } else if (game.gameOver) {
      // write game over on the screen
      ctx.font = "bold 50px Segoe UI";
      ctx.fillStyle = "red";
      ctx.textAlign = "center";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 5;

      ctx.strokeText("Game Over", ww / 2, wh / 2);

      ctx.fillText("Game Over", ww / 2, wh / 2);

      // write score on the screen
      ctx.font = "bold 30px Segoe UI";

      ctx.strokeText(`Score: ${game.score}`, ww / 2, wh / 2 + 50);
      ctx.fillText(`Score: ${game.score}`, ww / 2, wh / 2 + 50);
    }
  }
  function resetDom() {

    document.getElementById("breakout-score")?.remove();
    document.querySelectorAll("h1").forEach((h1) => {
      // set back to the original text
      h1.innerText = h1.getAttribute("data-original-text");
      // remove the h2
      h1.parentNode.removeChild(h1.nextSibling);
    });
    // stop animating title
    clearInterval(titleInterval);
    // set back to the original title
    document.title = document.ogTitle;
  }
  function destroy() {
    bar = null;
    ball = null;
    game = null;
    bodycanvas?.remove();
    resetDom();
  }
  function startGame() {
    game.start();
  }
  function resetGame() {
    destroy();
    strapiParticles();
  }
  function printConsoleInstructions() {
    console.log(`
     _____  __                       _                 
    / ___/ / /_ _____ ____ _ ____   (_)                
    \\__ \\ / __// ___// __ \`// __ \\ / /                 
   ___/ // /_ / /   / /_/ // /_/ // /                  
  /____/ \\__//_/    \\__,_// .___//_/                   
                         /_/                           
      ____                      __                  __ 
     / __ ) _____ ___   ____ _ / /__ ____   __  __ / /_
    / __  |/ ___// _ \\ / __ \`// //_// __ \\ / / / // __/
   / /_/ // /   /  __// /_/ // ,<  / /_/ // /_/ // /_  
  /_____//_/    \\___/ \\__,_//_/|_| \\____/ \\__,_/ \\__/ 
    
---------------------------------------------------
|  Welcome to the Strapi Breakout Game!                              
|  Made with ♥ by https://github.com/cpaczek                                    

|  Use the Arrow/AD keys or Mouse to move the paddle.         
|  Press Enter to start the game.                             
|  Press Escape to exit the game.                             
---------------------------------------------------
|  Secret Menu:                                                
|    Press P to toggle rendering (i.e pause the game).          
|    Change the speed by typing in the console: ball.speed = 15 
|    Exported Game Objects:
|      - ball
|      - bar
|      - game
|      - Particle (Class)
|      - Firework (Class)
|      - Game (Class)
|      - Bar (Class)
|      - Ball (Class)
---------------------------------------------------
    `);
  }
  window.addEventListener("mousemove", game.onMouseMove);
  window.addEventListener("click", onMouseClick);
  window.addEventListener("keydown", (e) => {
    if (e.code === "Enter") {
      if (game.gameOver) {
        resetGame();
      } else if (!game.active) {
        startGame();
      }
    }
    if (e.code === "Escape") {
      bodycanvas.remove();
      game.destroy();
    }
    if (e.code === "KeyP") {
      rendering.value = !rendering.value;
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
    if (document.getElementById("scene")) return;
    strapiParticles();
  }
});

window.game = game;
window.Particle = Particle;
window.Firework = Firework;
window.Bar = Bar;
window.Ball = Ball;
window.Game = Game;
window.rendering = rendering;
