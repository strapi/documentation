---
title: Users & Permissions providers
# description: todo
displayed_sidebar: cmsSidebar
tags:
- users and permissions
- providers
- configuration
- customization
---

# Users & Permissions providers

Strapi comes with a predefined set of built-in Users & Permissions providers. Custom providers can be configured.

 [Grant](https://github.com/simov/grant) and [Purest](https://github.com/simov/purest) allow you to use OAuth and OAuth2 providers to enable authentication in your application.

For a better understanding, review the following description of the login flow. The example uses `github` as the provider but it works the same for other providers.

## Understanding the login flow

Let's say that:
* Strapi's backend is located at: `strapi.website.com`, and
* Your app frontend is located at: `website.com`

1. The user goes on your frontend app (`https://website.com`) and clicks on your button `connect with Github`.
2. The frontend redirects the tab to the backend URL: `https://strapi.website.com/api/connect/github`.
3. The backend redirects the tab to the GitHub login page where the user logs in.
4. Once done, Github redirects the tab to the backend URL:`https://strapi.website.com/api/connect/github/callback?code=abcdef`.
5. The backend uses the given `code` to get an `access_token` from Github that can be used for a period of time to make authorized requests to Github to get the user info.
6. Then, the backend redirects the tab to the url of your choice with the param `access_token` (example: `http://website.com/connect/github/redirect?access_token=eyfvg`).
7. The frontend (`http://website.com/connect/github/redirect`) calls the backend with `https://strapi.website.com/api/auth/github/callback?access_token=eyfvg` that returns the Strapi user profile with its `jwt`. <br/> (Under the hood, the backend asks Github for the user's profile and a match is done on Github user's email address and Strapi user's email address).
8. The frontend now possesses the user's `jwt`, which means the user is connected and the frontend can make authenticated requests to the backend!

An example of a frontend app that handles this flow can be found here: [react login example app](https://github.com/strapi/strapi-examples/tree/master/examples/login-react).

## Setting up the server url

Before setting up a provider you must specify the absolute url of your backend in `server.js`.

**example -** `config/server.js`

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="config/server.js"

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('', 'http://localhost:1337'),
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="config/server.ts"

export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('', 'http://localhost:1337'),
});
```


</TabItem>

</Tabs>

:::tip
Later you will give this url to your provider. <br/> For development, some providers accept the use of localhost urls but many don't. In this case we recommend to use [ngrok](https://ngrok.com/docs) (`ngrok http 1337`) that will make a proxy tunnel from a url it created to your localhost url (ex: `url: env('', 'https://5299e8514242.ngrok.io'),`).
:::

## Setting up the provider - examples

Instead of a generic explanation we decided to show an example for each provider. You can also [create your own custom provider](#creating-a-custom-provider).

In the following examples, the frontend app will be the [react login example app](https://github.com/strapi/strapi-examples/tree/master/examples/login-react). <br/>
It (the frontend app) will be running on `http://localhost:3000`. <br/>
Strapi (the backend) will be running on `http://localhost:1337`.

<CustomDocCardsWrapper>
<CustomDocCard icon="plugs-connected" title="Auth0" description="Configure authentication through the Users & Permissions feature with Auth0." link="/dev-docs/configurations/users-and-permissions-providers/auth-zero" />
<CustomDocCard icon="plugs-connected" title="AWS Cognito" description="Configure authentication through the Users & Permissions feature with AWS Cognito." link="/dev-docs/configurations/users-and-permissions-providers/aws-cognito" />
<CustomDocCard icon="plugs-connected" title="CAS" description="Configure authentication through the Users & Permissions feature with CAS." link="/dev-docs/configurations/users-and-permissions-providers/cas" />
<CustomDocCard icon="plugs-connected" title="Discord" description="Configure authentication through the Users & Permissions feature with Discord." link="/dev-docs/configurations/users-and-permissions-providers/discord" />
<CustomDocCard icon="plugs-connected" title="Facebook" description="Configure authentication through the Users & Permissions feature with Facebook." link="/dev-docs/configurations/users-and-permissions-providers/facebook" />
<CustomDocCard icon="plugs-connected" title="GitHub" description="Configure authentication through the Users & Permissions feature with GitHub." link="/dev-docs/configurations/users-and-permissions-providers/github" />
<CustomDocCard icon="plugs-connected" title="Google" description="Configure authentication through the Users & Permissions feature with Google." link="/dev-docs/configurations/users-and-permissions-providers/google" />
<CustomDocCard icon="plugs-connected" title="Instagram" description="Configure authentication through the Users & Permissions feature with Instagram." link="/dev-docs/configurations/users-and-permissions-providers/instagram" />
<CustomDocCard icon="plugs-connected" title="Keycloak" description="Configure authentication through the Users & Permissions feature with Keycloak." link="/dev-docs/configurations/users-and-permissions-providers/keycloak" />
<CustomDocCard icon="plugs-connected" title="LinkedIn" description="Configure authentication through the Users & Permissions feature with LinkedIn." link="/dev-docs/configurations/users-and-permissions-providers/linkedin" />
<CustomDocCard icon="plugs-connected" title="Patreon" description="Configure authentication through the Users & Permissions feature with Patreon." link="/dev-docs/configurations/users-and-permissions-providers/patreon" />
<CustomDocCard icon="plugs-connected" title="Reddit" description="Configure authentication through the Users & Permissions feature with Reddit." link="/dev-docs/configurations/users-and-permissions-providers/reddit" />
<CustomDocCard icon="plugs-connected" title="Twitch" description="Configure authentication through the Users & Permissions feature with Twitch." link="/dev-docs/configurations/users-and-permissions-providers/twitch" />
<CustomDocCard icon="plugs-connected" title="Twitter" description="Configure authentication through the Users & Permissions feature with Twitter." link="/dev-docs/configurations/users-and-permissions-providers/twitter" />
<CustomDocCard icon="plugs-connected" title="VK" description="Configure authentication through the Users & Permissions feature with VK." link="/dev-docs/configurations/users-and-permissions-providers/vk" />
</CustomDocCardsWrapper>

## Creating a custom provider

You can also use the `register` lifecycle function to create your own custom provider in the `src/index.js|ts` file of your Strapi application. Use the following code example adjusted to your needs:

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

For additional information on parameters passed to `grantConfig`, please refer to the  [`grant` documentation](https://github.com/simov/grant). For additional information about `purest` please refer to [`purest` documentation](https://github.com/simov/purest).

### Setup the frontend

Once you have configured strapi and the provider, in your frontend app you have to :

- Create a button that links to `GET STRAPI_BACKEND_URL/api/connect/${provider}` (ex: `https://strapi.mywebsite/api/connect/github`).
- Create a frontend route like `FRONTEND_URL/connect/${provider}/redirect` that have to handle the `access_token` param and that have to request `STRAPI_BACKEND_URL/api/auth/${provider}/callback` with the `access_token` parameter.<br/>
  The JSON request response will be `{ "jwt": "...", "user": {...} }`.

Now you can make authenticated requests. More info here: [token usage](#token-usage).

:::caution Troubleshooting

- **Error 429**: It's most likely because your login flow fell into a loop. To make new requests to the backend, you need to wait a few minutes or restart the backend.
- **Grant: missing session or misconfigured provider**: It may be due to many things.
  - **The redirect url can't be built**: Make sure you have set the backend url in `config/server.js`: [Setting up the server url](#setting-up-the-server-url)
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

- In the admin panel: **Settings > USERS & PERMISSIONS PLUGIN > Advanced Settings > Reset Password** page, the `url` to your reset password page.
- In the admin panel: **Settings > USERS & PERMISSIONS PLUGIN > Email Template** page, the **Shipper email**.

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

#### Reset Password: send the new password

This action will update the user password.
This also works with the [GraphQL Plugin](./graphql), with the `resetPassword` mutation.

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
In production, make sure the `url` config property is set. Otherwise the validation link will redirect to `localhost`. More info on the config [here](/dev-docs/configurations/server).
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

## Adding a new provider (to your project)

:::caution
This documentation is not up-to-date with Strapi v4 and is a work in progress. In the meantime, [contributions](https://github.com/strapi/documentation/blob/main/CONTRIBUTING.md) are most welcome.
:::

**[Grant](https://github.com/simov/grant) supplies configuration for a number of commonly used OAuth providers. [Custom](https://github.com/simov/grant#misc-custom-providers) providers are also supported**. <br/> You can view and try out the 200+ supported providers here: [OAuth Playground](https://grant.outofindex.com/).

### Prepare your files

To add a new provider on Strapi, you will need to perform changes to the following files:

```
extensions/users-permissions/services/Providers.js
extensions/users-permissions/config/functions/bootstrap.js
```

If these files don't exist you will need to copy from your `node_modules` or the Strapi mono-repo. You can see [plugin extensions](/dev-docs/plugins-extension) for more information on how it works.

We will go step by step.

### Configure your Provider Request

Configure the new provider in the `Provider.js` file at the `getProfile` function.

The `getProfile` takes three params:

- **provider**: The name of the used provider as a string.
- **query**: The query is the result of the provider callback.
- **callback**: The callback function who will continue the internal Strapi login logic.

Here is an example that uses the `discord` provider.

### Configure your oauth generic information

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

For more specs on using the `Purest` module, please refer to the [Official Purest Documentation](https://github.com/simov/purest)

You may also want to take a look onto the numerous already made configurations [here](https://github.com/simov/purest-providers/blob/master/config/providers.json).

### Retrieve your user's information:

For our discord provider it will look like:

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

