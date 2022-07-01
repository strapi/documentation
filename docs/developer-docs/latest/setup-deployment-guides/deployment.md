---
title: Deployment - Strapi Developer Docs
description: Learn how to develop locally with Strapi and deploy Strapi with various hosting options.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/deployment.html
---

# Deployment

Strapi gives you many possible deployment options for your project or application. Strapi can be deployed on traditional hosting servers or services such as 21YunBox, Render, Heroku, AWS, Azure and others. The following documentation covers how to develop locally with Strapi and deploy Strapi with various hosting options.

::: strapi Database deployment
Deploying databases along with Strapi is covered in the [databases guide](/developer-docs/latest/setup-deployment-guides/configurations/required/databases.md#databases-installation-guides).
:::

## General guidelines

::: prerequisites
To provide the best possible environment for Strapi there are a few requirements, these apply in both a development (local) as well as a staging and production workflow.

- Node LTS (v14 or v16) **Note that odd-number releases of Node will never be supported (e.g. v13, v15).**
- NPM v6 or whatever ships with the LTS Node versions
- Typical standard build tools for your OS (the `build-essentials` package on most Debian-based systems)
- At least 1 CPU core (Highly recommended at least 2)
- At least 2 GB of RAM (Moderately recommended 4)
- Minimum required storage space recommended by your OS or 32 GB of **free** space
- A supported database version
  - MySQL >= 5.7.8
  - MariaDB >= 10.2.7
  - PostgreSQL >= 10
  - SQLite >= 3
- A supported operating system
  - Ubuntu >= 18.04 (LTS-Only)
  - Debian >= 9.x
  - CentOS/RHEL >= 8
  - macOS Mojave or newer (ARM not supported)
  - Windows 10
  - Docker - [docker repo](https://github.com/strapi/strapi-docker)
:::
### Application Configuration

#### 1. Configure

We always recommend you use environment variables to configure your application based on the environment. Here is an example:

**Path —** `./config/server.js`.

```js
module.exports = ({ env }) => ({
  host: env('APP_HOST', '0.0.0.0'),
  port: env.int('NODE_PORT', 1337),
});
```

Then you can create a `.env` file or directly use the deployment platform you use to set environment variables:

**Path —** `.env`.

```
APP_HOST=10.0.0.1
NODE_PORT=1338
```

::: tip
To learn more about configuration details, you can read the [configurations](/developer-docs/latest/setup-deployment-guides/configurations.md) documentation.
:::

#### 2. Launch the server

Before running your server in production you need to build your admin panel for production

:::: tabs card

::: tab yarn

```bash
NODE_ENV=production yarn build
```

:::

::: tab npm

```bash
NODE_ENV=production npm run build
```

:::

::: tab Windows

```bash
npm install cross-env
```

Then in your `package.json` scripts section:

```bash
"build:win": "cross-env NODE_ENV=production npm run build",
```

And run:

```bash
npm run build:win
```

:::

::::

Run the server with the `production` settings.

:::: tabs card

::: tab yarn

```bash
NODE_ENV=production yarn start
```

:::

::: tab npm

```bash
NODE_ENV=production npm start
```

:::

::: tab Windows

```bash
npm install cross-env
```

Then in your `package.json` scripts section:

```bash
"start:win": "cross-env NODE_ENV=production npm start",
```

And run:

```bash
npm run start:win
```

:::

::::

::: caution
We highly recommend using [pm2](https://github.com/Unitech/pm2/) to manage your process.
:::

If you need a server.js file to be able to run `node server.js` instead of `npm run start` then create a `./server.js` file as follows:

```js
const strapi = require('@strapi/strapi');

strapi(/* {...} */).start();
```

### Advanced configurations

If you want to host the administration on another server than the API, [please take a look at this dedicated section](/developer-docs/latest/development/admin-customization.md#deployment).

## Hosting Provider Guides

Manual guides for deployment on various platforms, for One-click and docker please see the [installation](/developer-docs/latest/setup-deployment-guides/installation.md) guides.

<div>
    <InstallLink link="deployment/hosting-guides/21yunbox.html">
    <template #icon>
    <svg width="64px" height="55px" viewBox="0 0 64 55" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <title>Group</title>
        <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g id="Artboard" transform="translate(0.000000, -5.000000)" fill="#FFFFFF" fill-rule="nonzero">
                <g id="Group" transform="translate(0.000000, 5.211429)">
                    <rect id="Rectangle" x="45.8057143" y="0" width="7.86285714" height="53.4857143"></rect>
                    <rect id="Rectangle" x="0" y="0" width="7.86285714" height="7.86285714"></rect>
                    <rect id="Rectangle" x="10.3314286" y="0" width="7.86285714" height="7.86285714"></rect>
                    <rect id="Rectangle" x="20.9371429" y="0" width="7.86285714" height="18.1942857"></rect>
                    <rect id="Rectangle" x="0" y="22.1257143" width="28.8" height="7.86285714"></rect>
                    <rect id="Rectangle" x="0" y="33.92" width="7.86285714" height="19.5657143"></rect>
                    <rect id="Rectangle" x="10.3314286" y="45.6228571" width="7.86285714" height="7.86285714"></rect>
                    <rect id="Rectangle" x="20.9371429" y="45.6228571" width="7.86285714" height="7.86285714"></rect>
                    <rect id="Rectangle" x="35.2" y="0" width="7.86285714" height="7.86285714"></rect>
                    <rect id="Rectangle" x="45.8057143" y="45.6228571" width="7.86285714" height="7.86285714"></rect>
                    <rect id="Rectangle" x="56.1371429" y="45.7142857" width="7.86285714" height="7.86285714"></rect>
                    <rect id="Rectangle" x="35.2" y="45.6228571" width="7.86285714" height="7.86285714"></rect>
                </g>
            </g>
        </g>
    </svg>
    </template>
        <template #title>21YunBox</template>
        <template #description>
            Step by step guide for deploying on 21YunBox
        </template>
    </InstallLink>
</div>

<div>
	<InstallLink link="deployment/hosting-guides/amazon-aws.html">
    <template #icon>
    <svg width="64" height="64" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g fill="#fff" fill-rule="evenodd"><path d="M15.63 31.388l-7.135-2.56V18.373l7.135 2.43zm1.3 0l7.135-2.56V18.373l-7.135 2.432zm-7.7-13.8l7.2-2.033 6.696 2.16-6.696 2.273zm-2.092-.8L0 14.22V3.75l7.135 2.43zm1.307 0l7.135-2.56V3.75L8.443 6.192zm-7.7-13.8l7.2-2.043 6.696 2.16-6.696 2.273zm23.052 13.8l-7.135-2.56V3.75l7.135 2.43zm1.3 0l7.135-2.56V3.75l-7.135 2.43zm-7.7-13.8l7.2-2.033 6.696 2.16-6.696 2.273z" fill-rule="nonzero"></path></g></svg>
    </template>
		<template #title>Amazon AWS</template>
		<template #description>
			Step by step guide for deploying on AWS EC2
		</template>
	</InstallLink>
</div>

<div>
	<InstallLink link="deployment/hosting-guides/azure.html">
    <template #icon>
    <svg width="100" height="77.43" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.68 15.24"><path d="M9.105 14.43l4.642-.82.043-.01-2.387-2.84a403.945 403.945 0 0 1-2.387-2.853c0-.014 2.465-6.802 2.479-6.826.004-.008 1.682 2.888 4.066 7.02l4.09 7.09.031.054-7.587-.001-7.587-.001 4.597-.812zM0 13.566c0-.004 1.125-1.957 2.5-4.34L5 4.893l2.913-2.445C9.515 1.104 10.83.002 10.836 0a.512.512 0 0 1-.047.118L7.625 6.903l-3.107 6.663-2.259.003c-1.242.002-2.259 0-2.259-.004z" fill="#fff"/></svg>
    </template>
		<template #title>Azure</template>
		<template #description>
			Step by step guide for deploying on Azure
		</template>
	</InstallLink>
</div>

<div>
	<InstallLink link="deployment/hosting-guides/cleavr.html">
    <template #icon>
        <svg width="200" height="200" viewBox="0 0 165 119" xmlns="http://www.w3.org/2000/svg">
            <g id="Artboard-9" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g id="SVG-Layer" transform="translate(3.000000, 0.000000)" fill="#FFFFFF" fill-rule="nonzero">
                    <g id="Group">
                        <path d="M134.86,25.668 C123.972,17.616 113.18,9.562 103.6,0 L42.4961,61 C52.0761,70.56 60.244,81.534 68.412,92.506 C94.428,74.486 123.872,39.256 134.864,25.668 L134.86,25.668 Z M99.872,14.998 C99.513,14.6425 99.227,14.2193 99.032,13.7527 C98.837,13.2862 98.737,12.7856 98.737,12.28 C98.737,11.7744 98.837,11.2738 99.032,10.8073 C99.227,10.3407 99.513,9.9175 99.872,9.562 C100.229,9.2031 100.653,8.9183 101.121,8.724 C101.588,8.5296 102.089,8.4296 102.595,8.4296 C103.101,8.4296 103.602,8.5296 104.07,8.724 C104.537,8.9183 104.961,9.2031 105.318,9.562 C105.678,9.9175 105.963,10.3407 106.158,10.8073 C106.353,11.2738 106.453,11.7744 106.453,12.28 C106.453,12.7856 106.353,13.2862 106.158,13.7527 C105.963,14.2193 105.678,14.6425 105.318,14.998 C104.574,15.6779 103.603,16.055 102.595,16.055 C101.587,16.055 100.616,15.6779 99.872,14.998 Z" id="Shape"></path>
                        <path d="M143.836,47.108 C147.97,42.176 147.668,35.23 143.23,31.908 C140.408,29.796 137.684,27.682 134.862,25.668 C123.87,39.358 94.426,74.488 68.41,92.506 C70.426,95.224 69.418,93.512 71.434,96.23 C74.762,100.658 81.72,100.86 86.66,96.734 C106.122,80.226 127.3,66.636 143.836,47.108 Z" id="Shape"></path>
                        <path d="M11.4123,115.456 L0.6203,104.686 C-0.0857,103.98 -0.0857,102.974 0.6203,102.27 L42.4683,60.496 C43.1723,59.792 44.1823,59.792 44.8883,60.496 L55.6763,71.266 C56.382,71.972 56.382,72.978 55.6763,73.682 L13.8323,115.456 C13.1263,116.16 12.0163,116.16 11.4123,115.456 Z" id="Shape"></path>
                    </g>
                </g>
            </g>
        </svg>    
    </template>
		<template #title>Cleavr</template>
		<template #description>
			Step by step guide for deploying to popular VPS providers using Cleavr
		</template>
	</InstallLink>
</div>

<div>
	<InstallLink link="deployment/hosting-guides/digitalocean-app-platform.html">
		<template #icon>
			<svg width="178" height="177" viewBox="0 0 178 177" xmlns="http://www.w3.org/2000/svg"><g fill="#fff" fill-rule="evenodd"><path d="M89 176.5v-34.2c36.2 0 64.3-35.9 50.4-74-5.1-14-16.4-25.3-30.5-30.4-38.1-13.8-74 14.2-74 50.4H.8C.8 30.6 56.6-14.4 117.1 4.5c26.4 8.3 47.5 29.3 55.7 55.7 18.9 60.5-26.1 116.3-83.8 116.3z" fill-rule="nonzero"></path><path d="M89.1 142.5H55v-34.1h34.1zM55 168.6H28.9v-26.1H55zM28.9 142.5H7v-21.9h21.9v21.9z"></path></g></svg>
		</template>
		<template #title>DigitalOcean App Platform</template>
		<template #description>
			Manual step by step guide for deploying on DigitalOcean App Platform
		</template>
	</InstallLink>
</div>

<div>
	<InstallLink link="deployment/hosting-guides/digitalocean.html">
		<template #icon>
			<svg width="178" height="177" viewBox="0 0 178 177" xmlns="http://www.w3.org/2000/svg"><g fill="#fff" fill-rule="evenodd"><path d="M89 176.5v-34.2c36.2 0 64.3-35.9 50.4-74-5.1-14-16.4-25.3-30.5-30.4-38.1-13.8-74 14.2-74 50.4H.8C.8 30.6 56.6-14.4 117.1 4.5c26.4 8.3 47.5 29.3 55.7 55.7 18.9 60.5-26.1 116.3-83.8 116.3z" fill-rule="nonzero"></path><path d="M89.1 142.5H55v-34.1h34.1zM55 168.6H28.9v-26.1H55zM28.9 142.5H7v-21.9h21.9v21.9z"></path></g></svg>
		</template>
		<template #title>DigitalOcean Droplets</template>
		<template #description>
			Manual step by step guide for deploying on DigitalOcean droplets
		</template>
	</InstallLink>
</div>

<div>
	<InstallLink link="deployment/hosting-guides/fly.html">
		<template #icon>
			<svg id="SvgjsSvg1001" width="288" height="288" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"><defs id="SvgjsDefs1002"></defs><g id="SvgjsG1008"><svg xmlns="http://www.w3.org/2000/svg" width="288" height="288" fill-rule="evenodd" viewBox="0 0 32 32"><path fill="url(#A)" d="M16.06 26.56c.038.01.077.017.112.033s.066.042.098.063l.006.006.032.028.055.05.238.222.43.432.442.495.266.337.235.34.186.317.136.292c.07.172.12.354.138.54l.006.103v.1l-.01.154c-.02.206-.066.4-.143.6a1.96 1.96 0 0 1-.2.372 2 2 0 0 1-.22.266 2.01 2.01 0 0 1-.206.182 2.08 2.08 0 0 1-.18.126l-.155.1c-.3.162-.653.253-1 .288l-.16.012-.178.004a3.24 3.24 0 0 1-.367-.022c-.203-.024-.404-.067-.597-.134a2.45 2.45 0 0 1-.477-.222c-.16-.098-.3-.215-.438-.352l-.23-.295c-.063-.1-.118-.205-.162-.314a2.09 2.09 0 0 1-.141-.57l-.012-.184.002-.147a1.65 1.65 0 0 1 .04-.267 2.18 2.18 0 0 1 .088-.284 3.09 3.09 0 0 1 .123-.276l.18-.32.22-.325.375-.474.427-.47.4-.4.172-.16.14-.126a.56.56 0 0 1 .21-.097zM16.244.004l.275.007.122.007.747.06 1.03.144.075.017 1 .246.282.083.32.1.4.146.302.126.47.22.263.133.532.3.163.098.726.524.177.154.5.452.43.456.118.13.503.662.076.12.388.648.1.207.22.482.228.562.076.218.243.877.2 1.185.033.368.03.53.002.077-.01.592-.007.1-.03.233-.167.945-.025.115-.384 1.186-.357.855-.454.9-.814 1.405-.42.633-.507.75-.366.496-.713.945-.5.6-.723.873-.505.585-.785.876-.494.537-1.495 1.546-.783.762-.433.407-.027.025-.033.03-.043.03-.03.014-.085.028-.204-.01-.018-.006-.1-.07-.014-.013-.015-.013-.058-.054-.173-.162-1.434-1.4-.444-.456-1.135-1.208-.27-.293-1.368-1.584-.383-.47-1.21-1.552-.12-.158-.916-1.335-.248-.397-.666-1.12-.2-.347-.575-1.2-.1-.235-.33-.92L6 11.45l-.093-.378-.08-.413-.063-.462-.024-.28-.01-.527.002-.1.014-.284.115-1.15.027-.148.26-1.148.006-.02.043-.128.183-.53.056-.134.297-.65.202-.378.286-.468.285-.416.198-.26.233-.278.255-.28.208-.2.548-.478.4-.332.484-.325.344-.22.73-.382 1.088-.447.922-.267.362-.08.498-.1.337-.05.52-.064.35-.03.704-.038.26-.003h.063l.224.005zm-.6 1.63l-.3.045c-.154.03-.306.07-.455.12a3.48 3.48 0 0 0-.467.199l-.292.168c-.705.448-1.244 1.12-1.64 1.847l-.188.37-.196.454-.215.6-.2.763-.186.98-.133 1.26-.033.804.018.924a13.86 13.86 0 0 0 .337 2.137c.205.886.472 1.758.773 2.616l1.28 3.178 1.888 3.8.05.093V1.633l-.024.002zm2.665.05a9.82 9.82 0 0 1 1.382.39c.64.234 1.257.54 1.823.92.768.516 1.44 1.172 1.96 1.938a7.25 7.25 0 0 1 .759 1.449c.292.75.46 1.547.53 2.348l.033.632-.012.588c-.035.44-.127.872-.25 1.294a10.06 10.06 0 0 1-.358 1.018l-.57 1.217a23.02 23.02 0 0 1-1.56 2.54c-.7 1.005-1.457 1.97-2.247 2.906l-2.582 2.844-.114.117 1.775-3.598.862-2.06.804-2.316.462-1.777a14.25 14.25 0 0 0 .251-1.554l.048-.684.003-.626-.03-.8c-.065-1.074-.23-2.144-.545-3.174l-.228-.656-.208-.488c-.404-.873-.97-1.7-1.733-2.285l-.256-.186z"></path><defs><linearGradient id="A" x1="5.74" x2="81.448" y1="0" y2="32" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffffff" class="stopColor109cf8 svgShape"></stop><stop offset="1" stop-color="#ffffff" class="stopColor935ee9 svgShape"></stop></linearGradient></defs></svg></g></svg>
		</template>
		<template #title>Fly.io</template>
		<template #description>
			Manual step by step guide for deploying on Fly.io
		</template>
	</InstallLink>
</div>

<div>
	<InstallLink link="deployment/hosting-guides/google-app-engine.html">
		<template #icon>
			<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24" version="1.1"><path d="M6.969 3L4.094 8.188l1.468 2.624L8.438 6h10.25L17 3zm8.75 4l2.969 4.906L13.625 21H17l5-9-2.781-5zM12 8c-2.207 0-4 1.793-4 4s1.793 4 4 4 4-1.793 4-4-1.793-4-4-4zM3.531 9.219L2 12l4.969 9H12.5l1.656-3h-5.75zM12 10c1.102 0 2 .898 2 2 0 1.102-.898 2-2 2-1.102 0-2-.898-2-2 0-1.102.898-2 2-2z" fill="#fff"/></svg>
		</template>
		<template #title>Google App Engine</template>
		<template #description>
			Manual step by step guide for deploying on GCP's App Engine
		</template>
	</InstallLink>
</div>

<div>
	<InstallLink link="deployment/hosting-guides/heroku.html">
    <template #icon>
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 5.12 5.12" preserveAspectRatio="xMinYMin meet"><path d="M3.068 4.415V2.382s.132-.487-1.63.2C1.436 2.6 1.436.7 1.436.7L2.01.697v1.2s1.61-.635 1.61.48v2.026h-.555zm.328-2.986h-.6c.22-.27.42-.73.42-.73h.63s-.108.3-.44.73zm-1.95 2.982V3.254l.58.58-.58.58z" fill="#fff"/></svg>
    </template>
		<template #title>Heroku</template>
		<template #description>
			Step by step guide for deploying on Heroku
		</template>
	</InstallLink>
</div>

<div>
	<InstallLink link="deployment/hosting-guides/render.html">
		<template #icon>
			<svg viewBox="21.7 21.7 181 181" xmlns="http://www.w3.org/2000/svg"><g><polygon class="st0" points="145 31.7 143 31.7 143 33.7 143 52.2 143 54.2 145 54.2 163.6 54.2 165.6 54.2 165.6 52.2 165.6 33.7 165.6 31.7 163.6 31.7" fill="#fff"/><path class="st0" d="M 85.2 31.7 C 78 31.7 71 33.1 64.4 35.9 C 58 38.6 52.3 42.5 47.4 47.4 C 42.5 52.3 38.6 58 35.9 64.4 C 33.1 71 31.7 78 31.7 85.2 L 31.7 163.6 L 31.7 165.6 L 33.7 165.6 L 52.3 165.6 L 54.3 165.6 L 54.3 163.6 L 54.3 84.9 C 54.7 76.8 58.1 69.2 63.8 63.6 C 69.6 57.9 77.2 54.6 85.3 54.3 L 126.5 54.3 L 128.5 54.3 L 128.5 52.3 L 128.5 33.7 L 128.5 31.7 L 126.5 31.7 L 85.2 31.7 Z" fill="#fff"/><polygon class="st0" points="182.1 105.9 180.1 105.9 180.1 107.9 180.1 126.5 180.1 128.5 182.1 128.5 200.7 128.5 202.7 128.5 202.7 126.5 202.7 107.9 202.7 105.9 200.7 105.9" fill="#fff"/><polygon class="st0" points="182.1 68.8 180.1 68.8 180.1 70.8 180.1 89.4 180.1 91.4 182.1 91.4 200.7 91.4 202.7 91.4 202.7 89.4 202.7 70.8 202.7 68.8 200.7 68.8" fill="#fff"/><polygon class="st0" points="200.7 31.7 182.1 31.7 180.1 31.7 180.1 33.7 180.1 52.2 180.1 54.2 182.1 54.2 200.7 54.2 202.7 54.2 202.7 52.2 202.7 33.7 202.7 31.7" fill="#fff"/><polygon class="st0" points="182.1 143 180.1 143 180.1 145 180.1 163.6 180.1 165.6 182.1 165.6 200.7 165.6 202.7 165.6 202.7 163.6 202.7 145 202.7 143 200.7 143" fill="#fff"/><polygon class="st0" points="182.1 180.1 180.1 180.1 180.1 182.1 180.1 200.7 180.1 202.7 182.1 202.7 200.7 202.7 202.7 202.7 202.7 200.7 202.7 182.1 202.7 180.1 200.7 180.1" fill="#fff"/><polygon class="st0" points="145 180.1 143 180.1 143 182.1 143 200.7 143 202.7 145 202.7 163.6 202.7 165.6 202.7 165.6 200.7 165.6 182.1 165.6 180.1 163.6 180.1" fill="#fff"/><polygon class="st0" points="107.9 180.3 105.9 180.3 105.9 182.3 105.9 200.9 105.9 202.9 107.9 202.9 126.5 202.9 128.5 202.9 128.5 200.9 128.5 182.3 128.5 180.3 126.5 180.3" fill="#fff"/><polygon class="st0" points="70.8 180.1 68.8 180.1 68.8 182.1 68.8 200.7 68.8 202.7 70.8 202.7 89.4 202.7 91.4 202.7 91.4 200.7 91.4 182.1 91.4 180.1 89.4 180.1" fill="#fff"/><polygon class="st0" points="33.7 180.1 31.7 180.1 31.7 182.1 31.7 200.7 31.7 202.7 33.7 202.7 52.2 202.7 54.2 202.7 54.2 200.7 54.2 182.1 54.2 180.1 52.2 180.1" fill="#fff"/></g></svg>
		</template>
		<template #title>Render</template>
		<template #description>
			Three different options for deploying on Render
		</template>
	</InstallLink>
</div>

<div>
	<InstallLink link="deployment/hosting-guides/qovery.html">
    <template #icon>
      <svg viewBox="0 0 276 325" width="276" height="325" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M203.48 124.771V272.797L275.927 230.983V80.2736L203.48 124.771Z" fill="#E7E7F9"/><path d="M141.541 0L0 77.367L77.5906 124.771L141.318 88.9944L203.48 124.771L275.927 80.2739L141.541 0Z" fill="white"/><path d="M0 77.3672L77.8142 124.771L77.1434 197.89L163.902 244.847L164.796 324.897L0 231.43V77.3672Z" fill="white"/><path d="M141.318 88.994L203.48 124.771C203.48 124.771 203.649 198.88 203.649 197.762C208.165 199.932 142.212 165.019 142.212 165.019L141.318 88.994Z" fill="white"/><path d="M77.1434 197.889L142.212 165.019L141.318 88.994L77.8142 124.771L77.1434 197.889Z" fill="#E7E7F9"/><path d="M163.902 244.846L77.1434 197.889L142.212 165.019L225.393 209.293L163.902 244.846Z" fill="white"/><path d="M164.796 324.897L224.275 284.872L225.393 209.294L163.902 244.847L164.796 324.897Z" fill="#E7E7F9"/><path d="M7.62292 82.0625C30.8777 96.3731 54.5589 110.473 77.8138 124.783C99.0561 112.932 120.082 100.847 141.325 88.996C162.12 100.847 182.705 112.92 203.5 124.771C224.742 111.355 246.226 98.852 267.363 85.5283L141.338 9.83838C96.8409 33.9876 52.3437 57.9132 7.62292 82.0625Z" fill="white"/></svg>
    </template>
		<template #title>Qovery</template>
		<template #description>
			Step by step guide for deploying on Qovery
		</template>
	</InstallLink>
</div>

<div>
	<InstallLink link="deployment/hosting-guides/microtica.html">
    <template #icon>
      <svg width="114" height="113" viewBox="0 0 114 113" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M57.0999 0.200012C25.8999 0.200012 0.699951 25.5 0.699951 56.6C0.699951 87.7 25.9999 113 57.0999 113C88.1999 113 113.5 87.7 113.5 56.6C113.5 25.5 88.2999 0.200012 57.0999 0.200012ZM88.1 83.2C88.1 83.2 87.5 76.6 84.6 71.6C81 65.3 74.5 62.9 69.5 68.6C61.7 77.4 60.7 84.1 51.4 83C41.8 81.9 30.1999 53.8 23.7999 84.2C23.7999 84.2 16.6 76.6 15.7 62.7C15.4 56 17.9999 49 24.7999 45.9C34.9 41.3 40.5999 52.1 46.2999 50.9C54.0999 49.3 50.9 40.1 58 29.9C67.8 15.9 89 27.1 94.2 42C102.6 66.2 88.1 83.2 88.1 83.2Z" fill="white"/></svg>
    </template>
		<template #title>Microtica</template>
		<template #description>
			Deploy on your AWS account with Microtica
		</template>
	</InstallLink>
</div>

## Optional Software Guides

Additional guides for optional software additions that compliment or improve the deployment process when using Strapi in a production or production-like environment.

<div>
	<InstallLink link="deployment/optional-software/caddy-proxy.html">
    <template #icon>
    <!-- <img src="assets/deployment/caddy-monotone.svg"/> -->
    CAD
    </template>
		<template #title>Caddy</template>
		<template #description>
			Overview of proxying Strapi with Caddy
		</template>
	</InstallLink>
</div>

<div>
	<InstallLink link="deployment/optional-software/haproxy-proxy.html">
    <template #icon>
    HAP
    </template>
		<template #title>HAProxy</template>
		<template #description>
			Overview of proxying Strapi with HAProxy
		</template>
	</InstallLink>
</div>

<div>
	<InstallLink link="deployment/optional-software/nginx-proxy.html">
    <template #icon>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-35.5 26 32 32" width="64" height="64"><path d="M-33.442 42.023v-7.637a.68.68 0 0 1 .385-.651l13.173-7.608c.237-.148.503-.178.74-.03l13.232 7.637a.71.71 0 0 1 .355.651V49.63a.71.71 0 0 1-.355.651l-11.367 6.57a56.27 56.27 0 0 1-1.806 1.036c-.266.148-.533.148-.8 0l-13.202-7.608c-.237-.148-.355-.326-.355-.622v-7.637z" fill="#fff"/><path d="M-24.118 39.18v8.9c0 1.006-.8 1.894-1.865 1.865-.65-.03-1.154-.296-1.5-.858-.178-.266-.237-.562-.237-.888V35.836c0-.83.503-1.42 1.154-1.687s1.302-.207 1.954 0c.622.178 1.095.562 1.5 1.036l7.874 9.443c.03.03.06.09.118.148v-9c0-.947.65-1.687 1.57-1.776 1.154-.148 1.924.68 2.042 1.54v12.6c0 .7-.326 1.214-.918 1.54-.444.237-.918.296-1.42.266a3.23 3.23 0 0 1-1.954-.829c-.296-.266-.503-.592-.77-.888l-7.49-8.97c0-.03-.03-.06-.06-.09z" fill="#3498DB"/></svg>
    </template>
		<template #title>Nginx</template>
		<template #description>
			Overview of proxying Strapi with Nginx
		</template>
	</InstallLink>
</div>

