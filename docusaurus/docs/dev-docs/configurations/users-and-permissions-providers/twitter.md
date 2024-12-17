---
title: Twitter provider for Users & Permissions
# description: todo
displayed_sidebar: cmsSidebar
tags:
- users and permissions
- providers
- configuration
- customization
---

# Twitter provider for Users & Permissions

<h4 id="twitter">Using ngrok</h4>

Twitter doesn't accept `localhost` urls. <br/>
Use `ngrok` to serve the backend app.

```
ngrok http 1337
```

Don't forget to update the server url in the backend config file `config/server.js` and the server url in your frontend app (environment variable `REACT_APP_BACKEND_URL` if you use [react login example app](https://github.com/strapi/strapi-examples/tree/master/examples/login-react)) with the generated ngrok url.

<h4 id="twitter-config">Twitter configuration</h4>

- Visit the Apps list page <br/> [https://developer.twitter.com/en/apps](https://developer.twitter.com/en/apps)
- Click on **Create an app** button
- Fill the information (replace with your own ngrok url):
  - **App name**: Strapi Twitter auth
  - **Application description**: This is a demo app for Strapi auth
  - **Tell us how this app will be used**: - here write a message enough long -
- At the end of the process you should see your Application ID and secret, save them for later
- Go to you app setting and click on edit **Authentication settings**
- Enable **3rd party authentication** AND **Request email address from users**
- Fill the information (replace with your own ngrok url):
  - **Callback URLs**: `https://65e60559.ngrok.io/api/connect/twitter/callback`
  - **Website URL**: `https://65e60559.ngrok.io`
  - **Privacy policy**: `https://d73e70e88872.ngrok.io`
  - **Terms of service**: `https://d73e70e88872.ngrok.io`

<h4 id="twitter-strapi-config">Strapi configuration</h4>

- Visit the User Permissions provider settings page <br/> [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
- Click on the **Twitter** provider
- Fill the information (replace with your own client ID and secret):
  - **Enable**: `ON`
  - **API Key**: yfN4ycGGmKXiS1njtIYxuN5IH
  - **Api Secret**: Nag1en8S4VwqurBvlW5OaFyKlzqrXFeyWhph6CZlpGA2V3VR3T
  - **The redirect URL to your front-end app**: `http://localhost:3000/connect/twitter/redirect`
