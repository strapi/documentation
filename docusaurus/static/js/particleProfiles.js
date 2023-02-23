

async function strapiParticles() {
    const profiles = []
    if (localStorage.getItem('profiles') && localStorage.getItem('profilesLastUpdated') && Date.now() - localStorage.getItem('profilesLastUpdated') < 1000 * 60 * 60 * 24 * 7) {
        // load profiles from local storage
        profiles.push(...JSON.parse(localStorage.getItem('profiles')))
        console.log("loaded profiles from local storage")
    } else {
        // fetch all the profiles from github on all the pages
        let page = 1
        while (true) {
            let res
            try {
                res = await fetch('https://api.github.com/repos/strapi/strapi/contributors?per_page=100&page=' + page)
            } catch (e) {
                console.log(e)
                break;
            }
            const data = await res.json()
            if (data.length == 0) {
                localStorage.setItem('profiles', JSON.stringify(profiles))
                localStorage.setItem('profilesLastUpdated', Date.now())
                break;
            }
            page++;
            data.forEach(profile => {
                if (profile.avatar_url) profiles.push(profile.avatar_url)
            })

        }
    }
    // create canvas element and append to body
    const bodycanvas = document.createElement('canvas');
    // add id scene to canvas
    bodycanvas.id = 'scene';
    document.body.appendChild(bodycanvas);
    const canvas = document.querySelector("#scene"),
        ctx = canvas.getContext("2d"),
        particles = [],
        amount = 0,
        mouse = { x: 0, y: 0 },
        radius = 1;

    // delete canvas if user hits escape
    document.addEventListener("keydown", function (event) {
        if (event.code === "Escape") {
            bodycanvas.remove();
        }
    });

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'destination-over';
    const ww = canvas.width = window.innerWidth;
    const wh = canvas.height = window.innerHeight;

    const profileIndex = 0
    function Particle(x, y) {
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
        if (profileIndex >= profiles.length) profileIndex = 0;
        this.image.src = profiles[profileIndex++];

    }

    Particle.prototype.render = function () {


        this.accX = (this.dest.x - this.x) / 50;
        this.accY = (this.dest.y - this.y) / 50;
        this.vx += this.accX;
        this.vy += this.accY;
        this.vx *= this.friction;
        this.vy *= this.friction;

        this.x += this.vx;
        this.y += this.vy;

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




        const a = this.x - mouse.x;
        const b = this.y - mouse.y;

        const distance = Math.sqrt(a * a + b * b);
        if (distance < (radius * 70)) {
            this.accX = (this.x - mouse.x) / 100;
            this.accY = (this.y - mouse.y) / 100;
            this.vx += this.accX;
            this.vy += this.accY;


        }

    }

    function onMouseMove(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;


    }

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
            const padding = 300
            const newWidth = ww - padding;
            const newHeight = newWidth / aspectRatio;
            // center the image
            ctx.drawImage(img, padding / 2, (wh - img.height) / 2, newWidth, newHeight);

            // Get the image data and create particles
            const data = ctx.getImageData(0, 0, ww, wh).data;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = "screen";

            particles = [];
            for (let i = 0; i < ww; i += Math.round(ww / 80)) {
                for (let j = 0; j < wh; j += Math.round(ww / 80)) {
                    if (data[((i + j * ww) * 4) + 3] > 80) {
                        particles.push(new Particle(i, j));
                    }
                }
            }


            amount = particles.length;
        };
    }

    function onMouseClick() {
        radius++;
        if (radius === 5) {
            radius = 0;
        }
    }

    function render(a) {
        requestAnimationFrame(render);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < amount; i++) {
            particles[i].render();
        }
    };
    window.addEventListener("resize", initScene);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("click", onMouseClick);
    initScene();
    requestAnimationFrame(render);

}
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
const pressed = [];
window.addEventListener('keydown', (e) => {
    pressed.push(e.code);
    pressed.splice(-konamiCode.length - 1, pressed.length - konamiCode.length);
    if (pressed.join('').includes(konamiCode.join(''))) {
        strapiParticles();
    }
})
