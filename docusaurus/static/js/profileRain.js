async function rainProfiles() {
    const profiles = []
    // fetch all profile images from the website https://api.github.com/repos/strapi/strapi/contributors?anon=1
    let page = 1
    let loadedFromCache = false;
    if (localStorage.getItem('profiles') && localStorage.getItem('profilesLastUpdated') && Date.now() - localStorage.getItem('profilesLastUpdated') < 1000 * 60 * 60 * 24 * 7) {
        // load profiles from local storage
        profiles.push(...JSON.parse(localStorage.getItem('profiles')))
        console.log("loaded profiles from local storage")
        loadedFromCache = true;
    }
    while (true) {
        // loaded from cache
        if (loadedFromCache) break;

        let res
        try {

            res = await fetch('https://api.github.com/repos/strapi/strapi/contributors?per_page=100&page=' + page)
        } catch (e) {
            console.log(e)
            break;
        }
        let data = await res.json()
        if (data.length == 0) {
            localStorage.setItem('profiles', JSON.stringify(profiles))
            // add last updated time to local storage
            localStorage.setItem('profilesLastUpdated', Date.now())
            break;
        }
        page++;
        data.forEach(profile => {
            if (profile.avatar_url) profiles.push(profile.avatar_url)
        })

    }

    const profileDiv = document.createElement('div');
    profileDiv.className = 'profileRainContainer';
    document.body.appendChild(profileDiv);
    setTimeout(() => {
        profileDiv.remove();
    }, 10000);

    async function createProfile(url) {


        const profile = document.createElement('div');
        profile.className = 'profileRain';
        profile.style.left = (Math.random() * window.innerWidth) - 50 + 'px';
        // add url as bg image
        profile.style.backgroundImage = `url(${url})`;
        // wait 1 second before adding profile to the DOM
        profileDiv.appendChild(profile);
        setTimeout(() => {
            profile.remove();
        }, 3000); // remove profile after 5 seconds
    }
    async function spawnProfiles() {
        profiles.forEach((url) => {
            let delay = Math.random() * 5000;
            setTimeout(createProfile, delay, url);
        })
    }
    spawnProfiles()

}
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
let pressed = [];
window.addEventListener('keydown', (e) => {
    pressed.push(e.code);
    pressed.splice(-konamiCode.length - 1, pressed.length - konamiCode.length);
    if (pressed.join('').includes(konamiCode.join(''))) {
        rainProfiles();
    }
})
