---
title: Creating and adding a custom Users & Permissions provider
description: todo
displayed_sidebar: cmsSidebar
tags:
- users & permissions
- providers
- configuration
- customization
---

# Creating and adding a custom Users & Permissions provider

Strapi provides a list of [built-in providers](/cms/configurations/users-and-permissions-providers#setting-up-the-provider---examples) for the [Users & Permissions feature](/cms/features/users-permissions). You can also create your own provider following this guide.

:::prerequisites
You have read the [Users & Permissions providers documentation](/cms/configurations/users-and-permissions-providers) and understood the login flow.
:::

## Creating a custom provider

You can use [the `register` lifecycle function](/cms/configurations/functions#register) to create your own custom provider in the `src/index.js|ts` file of your Strapi application. Use the following code example adjusted to your needs:

```js title="/src/index.js"
module.exports = {
  register({ strapi }) {
    strapi
      .plugin("users-permissions")
      .service("providers-registry")
      .add("example-provider-name", {
        icon: "",
        enabled: true,
        grantConfig: {
          key: "",
          secret: "",
          callback: `${strapi.config.server.url}/auth/example-provider-name/callback`,
          scope: ["email"],
          authorize_url: "https://awesome.com/authorize",
          access_url: "https://awesome.com/token",
          oauth: 2,
        },
        async authCallback({ accessToken, providers, purest }) {
          // use whatever you want here to get the user info
          return {
            username: "test",
            email: "test",
          };
        },
      });
  },
};
```

For additional information on parameters passed to `grantConfig`, please refer to the  <ExternalLink to="https://github.com/simov/grant" text="`grant` documentation"/>. For additional information about `purest` please refer to <ExternalLink to="https://github.com/simov/purest" text="`purest` documentation"/>.

### Frontend setup

Once you have configured Strapi and the provider, in your frontend application you must:

- Create a button that links to `GET STRAPI_BACKEND_URL/api/connect/${provider}` (e.g., `https://strapi.mywebsite/api/connect/github`).
- Create a frontend route like `FRONTEND_URL/connect/${provider}/redirect` that have to handle the `access_token` param and that have to request `STRAPI_BACKEND_URL/api/auth/${provider}/callback` with the `access_token` parameter.<br/>
  The JSON request response will be `{ "jwt": "...", "user": {...} }`.

Now you can make authenticated requests, as described in [token usage](/cms/features/users-permissions#token-usage).

:::caution Troubleshooting

- **Error 429**: It's most likely because your login flow fell into a loop. To make new requests to the backend, you need to wait a few minutes or restart the backend.
- **Grant: missing session or misconfigured provider**: It may be due to many things.
  - **The redirect url can't be built**: Make sure you have set the backend url in `config/server.js`: [Setting up the server url](/cms/configurations/users-and-permissions-providers#setting-up-the-server-url)
  - **A session/cookie/cache problem**: You can try again in a private tab.
  - **The incorrect use of a domain with ngrok**: Check your urls and make sure that you use the ngrok url instead of `http://localhost:1337`. Don't forget to check the backend url set in the example app at `src/config.js`.
- **You can't access your admin panel**: It's most likely because you built it with the backend url set with a ngrok url and you stopped/restarted ngrok. You need to replace the backend url with the new ngrok url and run `yarn build` or `npm run build` again.
:::

### Reset password

**Can only be used for users registered using the email provider.**

<Tabs>

<TabItem value="Forgot & Reset flow">

The assumed general flow:

1. The user goes to your **forgotten password page**.
2. The user enters their email address.
3. Your forgotten password page sends a request to the backend to send an email with the reset password link to the user.
4. The user receives the email and clicks on the special link.
5. The link redirects the user to your **reset password page**.
6. The user enters their new password.
7. The **reset password page** sends a request to the backend with the new password.
8. If the request contains the code contained in the link at step 3, the password is updated.
9. The user can log in with the new password.

The following section details steps 3 and 7.

#### Forgotten password: ask for the reset password link

This action sends an email to a user with the link to your reset password page. The link will be enriched with the url param `code` that is needed for the [reset password](#reset-password) at step 7.

First, you must specify the following:

- In the admin panel: _Settings > USERS & PERMISSIONS PLUGIN > Advanced Settings > Reset Password_ page, the `url` to your reset password page.
- In the admin panel: _Settings > USERS & PERMISSIONS PLUGIN > Email Template_ page, the _Shipper email_.

Then, your **forgotten password page** has to make the following request to your backend:

```js
import axios from 'axios';

// Request API.
axios
  .post('http://localhost:1337/api/auth/forgot-password', {
    email: 'user@strapi.io', // user's email
  })
  .then(response => {
    console.log('Your user received an email');
  })
  .catch(error => {
    console.log('An error occurred:', error.response);
  });
```

#### Reset Password: Send the new password

This action will update the user password.
This also works with the [GraphQL Plugin](/cms/plugins/graphql), with the `resetPassword` mutation.

Your **reset password page** has to make the following request to your backend:

```js
import axios from 'axios';

// Request API.
axios
  .post('http://localhost:1337/api/auth/reset-password', {
    code: 'privateCode', // code contained in the reset link of step 3.
    password: 'userNewPassword',
    passwordConfirmation: 'userNewPassword',
  })
  .then(response => {
    console.log("Your user's password has been reset.");
  })
  .catch(error => {
    console.log('An error occurred:', error.response);
  });
```

</TabItem>

<TabItem title="Change the password flow" value="Change the password flow">

You can also update an authenticated user password through the `/change-password` API endpoint:

```js
import axios from 'axios';

// Request API.
axios.post(
  'http://localhost:1337/api/auth/change-password',
  {
    currentPassword: 'currentPassword',
    password: 'userNewPassword',
    passwordConfirmation: 'userNewPassword',
  },
  {
    headers: {
      Authorization: 'Bearer <user jwt>',
    },
  }
);
```

</TabItem>

</Tabs>

### Email validation

:::note
In production, make sure the `url` config property is set. Otherwise the validation link will redirect to `localhost`. More info on the config [here](/cms/configurations/server).
:::

After registering, if you have set **Enable email confirmation** to **ON**, the user will receive a confirmation link by email. The user has to click on it to validate their registration.

Example of the confirmation link: `https://yourwebsite.com/api/auth/email-confirmation?confirmation=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNTk0OTgxMTE3LCJleHAiOjE1OTc1NzMxMTd9.0WeB-mvuguMyr4eY8CypTZDkunR--vZYzZH6h6sChFg`

If needed you can re-send the confirmation email by making the following request:

```js
import axios from 'axios';

// Request API.
axios
  .post(`http://localhost:1337/api/auth/send-email-confirmation`, {
    email: 'user@strapi.io', // user's email
  })
  .then(response => {
    console.log('Your user received an email');
  })
  .catch(error => {
    console.error('An error occurred:', error.response);
  });
```

## Adding a new provider to your Strapi application

:::info
This documentation might not up-to-date with Strapi 5 and is a work in progress. In the meantime, <ExternalLink to="https://github.com/strapi/documentation/blob/main/CONTRIBUTING.md" text="contributions"/> are most welcome.
:::

**<ExternalLink to="https://github.com/simov/grant" text="Grant"/> supplies configuration for a number of commonly used OAuth providers. <ExternalLink to="https://github.com/simov/grant#misc-custom-providers" text="Custom"/> providers are also supported**. <br/> You can view and try out the 200+ supported providers here: <ExternalLink to="https://grant.outofindex.com/" text="OAuth Playground"/>.

### Prepare your files

To add a new provider on Strapi, you will need to perform changes to the following files:

```
extensions/users-permissions/services/Providers.js
extensions/users-permissions/config/functions/bootstrap.js
```

If these files don't exist you will need to copy from your `node_modules` or the Strapi mono-repo. You can see [plugin extensions](/cms/plugins-development/plugins-extension) for more information on how it works.

We will go step by step.

### Configure your provider request

Configure the new provider in the `Provider.js` file at the `getProfile` function.

The `getProfile` takes three params:

- **provider**: The name of the used provider as a string.
- **query**: The query is the result of the provider callback.
- **callback**: The callback function who will continue the internal Strapi login logic.

Here is an example that uses the `discord` provider.

### Configure your OAuth generic information

```js
case 'discord': {
  const discord = new Purest({
    provider: 'discord',
    config: {
      'discord': {
        'https://discordapp.com/api/': {
          '__domain': {
            'auth': {
              'auth': {'bearer': '[0]'}
            }
          },
          '{endpoint}': {
            '__path': {
              'alias': '__default'
            }
          }
        }
      }
    }
  });
}
```

This code creates a `Purest` object that gives us a generic way to interact with the provider's REST API.

For more specs on using the `Purest` module, please refer to the <ExternalLink to="https://github.com/simov/purest" text="Official Purest Documentation"/>

You may also want to take a look onto the numerous already made configurations <ExternalLink to="https://github.com/simov/purest-providers/blob/master/config/providers.json" text="here"/>.

### Retrieve your user's information

For our Discord provider it will look like the following:

```js
  discord.query().get('users/@me').auth(access_token).request((err, res, body) => {
    if (err) {
      callback(err);
    } else {
      // Combine username and discriminator because discord username is not unique
      const username = `${body.username}#${body.discriminator}`;
      callback(null, {
        username,
        email: body.email
      });
    }
  });
  break;
}
```

Here is the next part of our switch. Now that we have properly configured our provider, we want to use it to retrieve
user information.

Here you see the real power of `purest`, you can simply make a get request on the desired URL, using the `access_token`
from the `query` parameter to authenticate.

That way, you should be able to retrieve the user info you need.

Now, you can simply call the `callback` function with the username and email of your user. That way, Strapi will be able
to retrieve your user from the database and log you in.

### Configure the new provider model onto database

Now, we need to configure our 'model' for our new provider. That way, our settings can be stored in the database, and
managed from the admin panel.

Open the file `packages/strapi-plugin-users-permissions/config/functions/bootstrap.js`

Add the fields your provider needs into the `grantConfig` object.
For our discord provider it will look like:

```js
discord: {
  enabled: false,  // make this provider disabled by default
  icon: 'comments', // The icon to use on the UI
  key: '',  // our provider app id (leave it blank, you will fill it with the Content Manager)
  secret: '', // our provider secret key (leave it blank, you will fill it with the Content Manager)
  callback: '/auth/discord/callback', // the callback endpoint of our provider
  scope: [  // the scope that we need from our user to retrieve information
    'identify',
    'email'
  ]
},
```
