---
title: Installation - Strapi Developer Docs
description: Learn many different options to install Strapi and getting started on using it.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/installation.html
---

# Installation

Strapi projects and applications can be installed either locally on a computer, manually on a remote server, or on third-party services offering one-click installations options. The following installation guides will guide you step-by-step to create a new Strapi project and get it started.

## Local installations

<div>
	<InstallLink link="installation/cli.html">
		<template #icon>
      <svg width="244px" height="244px" viewBox="0 0 244 244" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <g transform="translate(-567.000000, -357.000000)" fill="#FFFFFF">
            <g transform="translate(564.000000, 357.000000)">
              <g transform="translate(0.000000, 0.760305)">
                <path d="M164.892662,165.07248 L164.892662,86.343565 C164.892662,83.5395527 162.619561,81.2664516 159.815549,81.2664516 L81.177926,81.2664516 L81.177926,0 L240.993475,0 C243.797487,-1.5457868e-14 246.070588,2.2731011 246.070588,5.0771134 L246.070588,165.07248 L164.892662,165.07248 Z"></path><path d="M81.177926,0 L81.177926,81.2664516 L6.12389787,81.2664516 C4.72189171,81.2664516 3.58534116,80.129901 3.58534116,78.7278949 C3.58534116,78.0551071 3.85241582,77.4098346 4.32788926,76.9338427 L81.177926,0 Z"  opacity="0.404989"></path><path d="M246.070588,171.205824 L246.070588,246.338931 L164.892662,246.338931 L241.736023,169.411772 C242.726851,168.419864 244.334176,168.418988 245.326084,169.409816 C245.802754,169.885967 246.070588,170.532078 246.070588,171.205824 Z" opacity="0.404989" transform="translate(205.481625, 205.705706) scale(-1, -1) translate(-205.481625, -205.705706) "></path><path d="M81.177926,81.2664516 L162.354106,81.2664516 C163.756112,81.2664516 164.892662,82.4030021 164.892662,83.8050083 L164.892662,165.07248 L86.2550394,165.07248 C83.4510271,165.07248 81.177926,162.799379 81.177926,159.995366 L81.177926,81.2664516 Z" opacity="0.404989"></path>
              </g>
            </g>
          </g>
        </g>
      </svg>
		</template>
		<template #title>CLI (recommended)</template>
		<template #description>
			Create a project on your local machine using the CLI.
		</template>
	</InstallLink>
</div>

<div>
	<InstallLink link="installation/docker.html">
		<template #icon>
			<svg xmlns="http://www.w3.org/2000/svg" width="34" height="23"><g fill="#fff" fill-rule="evenodd"><path d="M18.8017 10.5442h3.4333v-3.101h-3.4333zM14.745 10.5442h3.4333v-3.101H14.745v3.101zM10.6892 10.5442h3.4325v-3.101h-3.4334v3.101zM6.6316 10.5442h3.4334v-3.101H6.6316zM2.5759 10.5442h3.4324v-3.101H2.576v3.101zM6.6326 6.8226h3.4324v-3.101H6.6316v3.101zM10.6892 6.8226h3.4325v-3.101h-3.4334v3.101zM14.745 6.8226h3.4333v-3.101H14.745v3.101zM14.745 3.101h3.4333V0H14.745v3.101z"></path><path d="M28.752 8.3043c-.1708-1.2412-.8667-2.317-2.1326-3.2901l-.727-.482-.4866.7243c-.6197.9309-.9318 2.2216-.829 3.46.046.4351.19 1.2145.6408 1.8993-.4498.2405-1.3366.572-2.5144.549H.1285l-.045.2589c-.2111 1.2439-.2075 5.1252 2.329 8.1087 1.9269 2.2675 4.8168 3.4178 8.5889 3.4178 8.1757 0 14.2245-3.741 17.0565-10.5406 1.1136.022 3.5132.0064 4.7461-2.3326.0312-.0533.1056-.1947.3204-.638l.1184-.2424-.693-.46c-.75-.4984-2.4723-.681-3.7979-.4323z"></path></g></svg>
		</template>
		<template #title>Docker</template>
		<template #description>
      Create a project on your local machine using Docker.
    </template>
	</InstallLink>
</div>

## One-click installations

!!!include(developer-docs/latest/setup-deployment-guides/snippets/one-click-install-not-updated.md)!!!

<div>
	<InstallLink link="installation/digitalocean-one-click.html">
		<template #icon>
			<svg width="178" height="177" viewBox="0 0 178 177" xmlns="http://www.w3.org/2000/svg"><g fill="#fff" fill-rule="evenodd"><path d="M89 176.5v-34.2c36.2 0 64.3-35.9 50.4-74-5.1-14-16.4-25.3-30.5-30.4-38.1-13.8-74 14.2-74 50.4H.8C.8 30.6 56.6-14.4 117.1 4.5c26.4 8.3 47.5 29.3 55.7 55.7 18.9 60.5-26.1 116.3-83.8 116.3z" fill-rule="nonzero"></path><path d="M89.1 142.5H55v-34.1h34.1zM55 168.6H28.9v-26.1H55zM28.9 142.5H7v-21.9h21.9v21.9z"></path></g></svg>
		</template>
		<template #title>DigitalOcean One-click</template>
		<template #description>
			Create a project hosted on DigitalOcean.
		</template>
	</InstallLink>
</div>

<div>
	<InstallLink link="installation/platformsh.html">
		<template #icon>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><defs><style>.bcac695a-a0a4-4100-84fd-61ecc421091c{fill:#0a0a0a;}.fc8dd422-fb02-4822-a57e-c20c8b5eef7c{fill:#fff;}</style></defs><g id="b5f9bb49-1614-4b22-8c04-f5182c1803f5" data-name="Layer 2"><g id="b2a28560-5e48-4435-accd-e149b4f96cc0" data-name="Layer 1"><rect class="fc8dd422-fb02-4822-a57e-c20c8b5eef7c" x="10.73" y="10.72" width="28.55" height="11.35"/><rect class="fc8dd422-fb02-4822-a57e-c20c8b5eef7c" x="10.73" y="35.42" width="28.55" height="3.86"/><rect class="fc8dd422-fb02-4822-a57e-c20c8b5eef7c" x="10.73" y="25.74" width="28.55" height="5.82"/></g></g></svg>
		</template>
		<template #title>Platform.sh One-click</template>
		<template #description>
			Create a project hosted on Platform.sh.
		</template>
	</InstallLink>
</div>

<div>
	<InstallLink link="installation/render.html">
		<template #icon>
			<svg viewBox="21.7 21.7 181 181" xmlns="http://www.w3.org/2000/svg"><g><polygon class="st0" points="145 31.7 143 31.7 143 33.7 143 52.2 143 54.2 145 54.2 163.6 54.2 165.6 54.2 165.6 52.2 165.6 33.7 165.6 31.7 163.6 31.7" fill="#fff"/><path class="st0" d="M 85.2 31.7 C 78 31.7 71 33.1 64.4 35.9 C 58 38.6 52.3 42.5 47.4 47.4 C 42.5 52.3 38.6 58 35.9 64.4 C 33.1 71 31.7 78 31.7 85.2 L 31.7 163.6 L 31.7 165.6 L 33.7 165.6 L 52.3 165.6 L 54.3 165.6 L 54.3 163.6 L 54.3 84.9 C 54.7 76.8 58.1 69.2 63.8 63.6 C 69.6 57.9 77.2 54.6 85.3 54.3 L 126.5 54.3 L 128.5 54.3 L 128.5 52.3 L 128.5 33.7 L 128.5 31.7 L 126.5 31.7 L 85.2 31.7 Z" fill="#fff"/><polygon class="st0" points="182.1 105.9 180.1 105.9 180.1 107.9 180.1 126.5 180.1 128.5 182.1 128.5 200.7 128.5 202.7 128.5 202.7 126.5 202.7 107.9 202.7 105.9 200.7 105.9" fill="#fff"/><polygon class="st0" points="182.1 68.8 180.1 68.8 180.1 70.8 180.1 89.4 180.1 91.4 182.1 91.4 200.7 91.4 202.7 91.4 202.7 89.4 202.7 70.8 202.7 68.8 200.7 68.8" fill="#fff"/><polygon class="st0" points="200.7 31.7 182.1 31.7 180.1 31.7 180.1 33.7 180.1 52.2 180.1 54.2 182.1 54.2 200.7 54.2 202.7 54.2 202.7 52.2 202.7 33.7 202.7 31.7" fill="#fff"/><polygon class="st0" points="182.1 143 180.1 143 180.1 145 180.1 163.6 180.1 165.6 182.1 165.6 200.7 165.6 202.7 165.6 202.7 163.6 202.7 145 202.7 143 200.7 143" fill="#fff"/><polygon class="st0" points="182.1 180.1 180.1 180.1 180.1 182.1 180.1 200.7 180.1 202.7 182.1 202.7 200.7 202.7 202.7 202.7 202.7 200.7 202.7 182.1 202.7 180.1 200.7 180.1" fill="#fff"/><polygon class="st0" points="145 180.1 143 180.1 143 182.1 143 200.7 143 202.7 145 202.7 163.6 202.7 165.6 202.7 165.6 200.7 165.6 182.1 165.6 180.1 163.6 180.1" fill="#fff"/><polygon class="st0" points="107.9 180.3 105.9 180.3 105.9 182.3 105.9 200.9 105.9 202.9 107.9 202.9 126.5 202.9 128.5 202.9 128.5 200.9 128.5 182.3 128.5 180.3 126.5 180.3" fill="#fff"/><polygon class="st0" points="70.8 180.1 68.8 180.1 68.8 182.1 68.8 200.7 68.8 202.7 70.8 202.7 89.4 202.7 91.4 202.7 91.4 200.7 91.4 182.1 91.4 180.1 89.4 180.1" fill="#fff"/><polygon class="st0" points="33.7 180.1 31.7 180.1 31.7 182.1 31.7 200.7 31.7 202.7 33.7 202.7 52.2 202.7 54.2 202.7 54.2 200.7 54.2 182.1 54.2 180.1 52.2 180.1" fill="#fff"/></g></svg>
		</template>
		<template #title>Render One-click</template>
		<template #description>
			Create a project hosted on Render.
		</template>
	</InstallLink>
</div>

<div>
	<InstallLink link="installation/heroku.html">
		<template #icon>
			<svg id="svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
			width="178" height="177.07042253521126" viewBox="0, 0, 400,445.07042253521126"><g id="svgg"><path id="path0" d="M27.717 2.652 
			C 16.677 6.624,11.842 10.559,6.191 20.174 L 0.939 29.108 0.939 222.535 L 0.939 415.962 6.153 424.833 C 9.534 430.585,14.486 
			435.536,20.238 438.917 L 29.108 444.131 200.000 444.131 L 370.892 444.131 379.762 438.917 C 385.514 435.536,390.466 430.585,393.847 
			424.833 L 399.061 415.962 399.061 222.535 L 399.061 29.108 393.847 20.238 C 390.466 14.486,385.514 9.534,379.762 6.153 L 370.892
			0.939 202.817 0.532 C 65.9050.200,33.439 0.593,27.717 2.652 M371.975 28.025 L 377.465 33.514 377.465 222.535 L 377.465 411.557 
			371.975 417.046 L 366.486 422.535 200.000 422.535 L 33.514 422.535 28.025 417.046 L 22.535 411.557 22.535 222.535 L 22.535 33.514 28.025 28.025 L 33.514 22.535 200.000 22.535 L 366.486 22.535 371.975 28.025 M99.531 163.271 L 99.531 258.937 117.667 250.519 C 167.281 227.492,221.384 215.965,241.129 224.215 C 253.767 229.495,253.521 227.860,253.521 306.521 L 253.521 377.465 276.136 377.465 L 298.752 377.465 298.202 301.878 L 297.653 226.291 292.394 215.582 C 272.785 175.651,228.317 168.762,146.009 192.901 C 142.926 193.806,142.723 189.974,142.723 130.735 L 142.723 67.606 121.127 67.606 L 99.531 67.606 99.531 163.271 M253.545 75.587 C 249.606 91.312,241.742 109.222,232.685 123.096 C 227.619 130.856,223.474 137.602,223.474 138.086 C 223.474 138.571,233.150 138.967,244.976 138.967 L 266.477 138.967 274.794 127.230 C 285.331 112.360,289.657 103.712,294.624 87.596 C 301.105 66.566,302.018 67.606,277.068 67.606 L 255.544 67.606 253.545 75.587 M101.408 332.982 C 101.408 356.415,101.879 375.587,102.455 375.587 C 104.950 375.587,150.228 333.542,148.895 332.462 C 146.966 330.900,113.254 301.100,106.573 295.052 L 101.408 290.377 101.408 332.982 " stroke="none" fill="#000000" fill-rule="evenodd"></path></g></svg>
		</template>
		<template #title>Heroku One-click</template>
		<template #description>
			Create a project hosted on Heroku.
		</template>
	</InstallLink>
</div>
