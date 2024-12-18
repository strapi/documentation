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

Strapi comes with a predefined set of built-in providers for the [Users & Permissions feature](/user-docs/features/users-permissions). Custom providers can also be configured (see the [dedicated guide](/dev-docs/configurations/users-and-permissions-providers/new-provider-guide)).

## Understanding the login flow

[Grant](https://github.com/simov/grant) and [Purest](https://github.com/simov/purest) allow you to use OAuth and OAuth2 providers to enable authentication in your application.

For a better understanding, review the following description of the login flow. The example uses `github` as the provider but it works the same for other providers.

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

An example of a frontend app that handles this flow can be found here: [react login example application](https://github.com/strapi/strapi-examples/tree/master/examples/login-react).

## Setting up the server URL

Before setting up a provider you must specify the absolute URL of your backend in `/config/server`:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/server.js"
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('', 'http://localhost:1337'),
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="/config/server.ts"
export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('', 'http://localhost:1337'),
});
```

</TabItem>

</Tabs>

:::tip
Later you will give this URL to your provider. <br/> For development, some providers accept the use of localhost urls but many don't. In this case we recommend to use [ngrok](https://ngrok.com/docs) (`ngrok http 1337`) that will make a proxy tunnel from a url it created to your localhost url (e.g., `url: env('', 'https://5299e8514242.ngrok.io'),`).
:::

## Setting up the provider - Examples

Instead of a generic explanation we decided to show an example for each provider. You can also [create your own custom provider](/dev-docs/configurations/users-and-permissions-providers/new-provider-guide).

In the following examples, the frontend application will be the [react login example application](https://github.com/strapi/strapi-examples/tree/master/examples/login-react)  running on `http://localhost:3000`, while Strapi (i.e., the backend server) will be running on `http://localhost:1337`.

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

If you want to create and add a new custom provider, please refer to the following guide:

<CustomDocCardsWrapper>
<CustomDocCard icon="plugs-connected" title="Custom provider guide" description="Learn how to create a custom Users & Permissions provider and add it to your Strapi application" link="/dev-docs/configurations/users-and-permissions-providers/new-provider-guide" />
</CustomDocCardsWrapper>
