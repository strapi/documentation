---
title: Patreon provider for Users & Permissions
# description: todo
displayed_sidebar: cmsSidebar
tags:
- users and permissions
- providers
- configuration
- customization
---

# Patreon provider for Users & Permissions

<h4 id="patreon">Using ngrok</h4>

Patreon does not accept `localhost` urls. <br/>
Use `ngrok` to serve the backend app.

```bash
ngrok http 1337
```

Don't forget to update the server url in the Strapi config file `./config/server.js` and the server URL in your frontend app (environment variable `REACT_APP_BACKEND_URL` if you use [react login example app](https://github.com/strapi/strapi-examples/tree/master/examples/login-react)) with the generated ngrok URL.

<h4 id="patreon-config">Patreon configuration</h4>

- You must be a Patreon Creator in order to register an Oauth client.
- Go to the [Patreon developer portal](https://www.patreon.com/portal)
- Click on [Clients & API Keys](https://www.patreon.com/portal/registration/register-clients)
- Click on "Create Client"
- Enter the details of your organization and website.
- There is a drop-down for "App Category" but no explanation of what the different categories mean.
"Community" seems to work fine.
- You can choose either version 1 or version 2 of the API - neither are actively developed.
Version 2 is probably the best choice. See their
[developer docs](https://docs.patreon.com/#introduction) for more detail.
- Under "Redirect URI's" enter `https://your-site.com/api/connect/patreon/callback`
- Save the client details and you will then see the Client ID and Client Secret.

<h4 id="patreon-strapi-config">Strapi configuration</h4>

- Visit the User Permissions provider settings page <br/> [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
- Click on the **Patreon** provider
- Fill the information:
  - Enable: `ON`
  - Client ID: `<Your Patreon Client ID>` - as above
  - Client Secret: `<Your Patreon Client Secret>` - as above
