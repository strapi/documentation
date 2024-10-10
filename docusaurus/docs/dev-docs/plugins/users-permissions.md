---
title: Users & Permissions plugin
displayed_sidebar: cmsSidebar
toc_max_heading_level: 5
description: Protect your API with a full authentication process based on JWT and manage the permissions between the groups of users.
tags:
- authenticated role
- JSON Web Tokens (JWT)
- JWT configuration
- keycloak
- ngrok
- plugins
- provider
- public role
- password
- Users, Roles & Permissions 
---

# Users & Permissions plugin

The Users & Permissions plugin provides a full authentication process based on [JSON Web Tokens (JWT)](https://en.wikipedia.org/wiki/JSON_Web_Token) to protect your API, and an access-control list (ACL) strategy that enables you to manage permissions between groups of users. The Users & Permissions plugin is installed by default and can not be uninstalled. 

The user guide describes how to use the [Users & Permissions plugin](/user-docs/users-roles-permissions) from the admin panel. The present page is more about the developer-related aspects of using the Users & Permissions plugin.

## Concept

The Users & Permissions plugin adds an access layer to your application.
The plugin uses `JWTs` to authenticate users. Your JWT contains your user ID, which is matched to the group your user is in and used to determine whether to allow access to the route.

Each time an API request is sent the server checks if an `Authorization` header is present and verifies if the user making the request has access to the resource.

## Manage role permissions

### Public role

This is the default role used when the server receives a request without an `Authorization` header. Any permissions (i.e. accessible endpoints) granted to this role will be accessible by anyone.

It is common practice to select `find` / `findOne` endpoints when you want your front-end application to access all the content without requiring user authentication and authorization.

### Authenticated role

This is the default role that is given to every **new user** at creation if no role is provided. In this role you define routes that a user can access.

### Permissions management

By clicking on the **Role** name, you can see all functions available in your application (with these functions related to the specific route displayed).

If you check a function name, it makes this route accessible by the current role you are editing. On the right sidebar you can see the URL related to this function.

### Update the default role

When you create a user without a role, or if you use the `/api/auth/local/register` route, the `authenticated` role is given to the user.

To change the default role, go to the `Advanced settings` tab and update the `Default role for authenticated users` option.

## Authentication

### Login

Submit the user's identifier and password credentials for authentication. On successful authentication the response data will have the user's information along with an authentication token.

#### Local

The `identifier` param can be an **email** or **username**.

<Tabs>

<TabItem value="Axios" title="Axios">

```js
import axios from 'axios';

// Request API.
axios
  .post('http://localhost:1337/api/auth/local', {
    identifier: 'user@strapi.io',
    password: 'strapiPassword',
  })
  .then(response => {
    // Handle success.
    console.log('Well done!');
    console.log('User profile', response.data.user);
    console.log('User token', response.data.jwt);
  })
  .catch(error => {
    // Handle error.
    console.log('An error occurred:', error.response);
  });
```

</TabItem>

<TabItem value="Postman" title="Postman">

If you use **Postman**, set the **body** to **raw** and select **JSON** as your data format:

```json
{
  "identifier": "user@strapi.io",
  "password": "strapiPassword"
}
```

If the request is successful you will receive the **user's JWT** in the `jwt` key:  

```json
{
    "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTc2OTM4MTUwLCJleHAiOjE1Nzk1MzAxNTB9.UgsjjXkAZ-anD257BF7y1hbjuY3ogNceKfTAQtzDEsU",
    "user": {
        "id": 1,
        "username": "user",
        ...
    }
}
```

</TabItem>
</Tabs>

### Token usage

The `jwt` may then be used for making permission-restricted API requests. To make an API request as a user place the JWT into an `Authorization` header of the `GET` request.

Any request without a token will assume the `public` role permissions by default. Modify the permissions of each user's role in the admin dashboard.

Authentication failures return a `401 (unauthorized)` error.

#### Usage

The `token` variable is the `data.jwt` received when logging in or registering.

```js
import axios from 'axios';

const token = 'YOUR_TOKEN_HERE';

// Request API.
axios
  .get('http://localhost:1337/posts', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then(response => {
    // Handle success.
    console.log('Data: ', response.data);
  })
  .catch(error => {
    // Handle error.
    console.log('An error occurred:', error.response);
  });
```

### JWT configuration

You can configure the JWT generation by using the [plugins configuration file](/dev-docs/configurations/plugins).

Strapi uses [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) to generate the JWT.

Available options:

- `jwtSecret`: random string used to create new JWTs, typically set using the `JWT_SECRET` [environment variable](/dev-docs/configurations/environment#strapi).
- `jwt.expiresIn`: expressed in seconds or a string describing a time span.<br/>
  Eg: 60, "45m", "10h", "2 days", "7d", "2y". A numeric value is interpreted as a seconds count. If you use a string be sure you provide the time units (minutes, hours, days, years, etc), otherwise milliseconds unit is used by default ("120" is equal to "120ms").

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/plugins.js"

module.exports = ({ env }) => ({
  // ...
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d',
      },
    },
  },
  // ...
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/plugins.ts"

export default ({ env }) => ({
  // ...
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d',
      },
    },
  },
  // ...
});
```

</TabItem>

</Tabs>

:::warning
Setting JWT expiry for more than 30 days is **not recommended** due to security concerns.
:::

### Registration

#### Configuration

If you have added any additional fields to your user model that need to be accepted on registration, they need to be added to the list of allowed fields in the `register` configuration option, otherwise they will not be accepted.

For example, if you have added a field called "nickname" that you wish to accept from the API on user registration:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/plugins.js"
module.exports = ({ env }) => ({
  // ...
  "users-permissions": {
    config: {
      register: {
        allowedFields: ["nickname"],
      },
    },
  },
  // ...
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/plugins.ts"
export default ({ env }) => ({
  // ...
  "users-permissions": {
    config: {
      register: {
        allowedFields: ["nickname"],
      },
    },
  },
  // ...
});
```

</TabItem>

</Tabs>


#### Usage

Creates a new user in the database with a default role as 'registered'.

```js
import axios from 'axios';

// Request API.
// Add your own code here to customize or restrict how the public can register new users.
axios
  .post('http://localhost:1337/api/auth/local/register', {
    username: 'Strapi user',
    email: 'user@strapi.io',
    password: 'strapiPassword',
  })
  .then(response => {
    // Handle success.
    console.log('Well done!');
    console.log('User profile', response.data.user);
    console.log('User token', response.data.jwt);
  })
  .catch(error => {
    // Handle error.
    console.log('An error occurred:', error.response);
  });
```

### Providers

 [Grant](https://github.com/simov/grant) and [Purest](https://github.com/simov/purest) allow you to use OAuth and OAuth2 providers to enable authentication in your application.

For a better understanding, review the following description of the login flow. The example uses `github` as the provider but it works the same for other providers.

#### Understanding the login flow

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

#### Setting up the server url

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

#### Setting up the provider - examples

Instead of a generic explanation we decided to show an example for each provider. You can also [create your own custom provider](#creating-a-custom-provider).

In the following examples, the frontend app will be the [react login example app](https://github.com/strapi/strapi-examples/tree/master/examples/login-react). <br/>
It (the frontend app) will be running on `http://localhost:3000`. <br/>
Strapi (the backend) will be running on `http://localhost:1337`.

<Tabs>

<TabItem title="GitHub" value="GitHub">

<h4 id="github">Using ngrok</h4>

Github doesn't accept `localhost` urls. <br/>
Use `ngrok` to serve the backend app.

```
ngrok http 1337
```

Don't forget to update the server url in the backend config file `config/server.js` and the server url in your frontend app (environment variable `REACT_APP_BACKEND_URL` if you use [react login example app](https://github.com/strapi/strapi-examples/tree/master/examples/login-react)) with the generated ngrok url.

<h4 id="github-config">Github configuration</h4>

- Visit the OAuth Apps list page [https://github.com/settings/developers](https://github.com/settings/developers)
- Click on **New OAuth App** button
- Fill the information (replace with your own ngrok url):
  - **Application name**: Strapi GitHub auth
  - **Homepage URL**: `https://65e60559.ngrok.io`
  - **Application description**: Strapi provider auth description
  - **Authorization callback URL**: `https://65e60559.ngrok.io/api/connect/github/callback`

<h4 id="github-strapi-config">Strapi configuration</h4>

- Visit the User Permissions provider settings page <br/> [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
- Click on the **GitHub** provider
- Fill the information (replace with your own client ID and secret):
  - **Enable**: `ON`
  - **Client ID**: 53de5258f8472c140917
  - **Client Secret**: fb9d0fe1d345d9ac7f83d7a1e646b37c554dae8b
  - **The redirect URL to your front-end app**: `http://localhost:3000/connect/github/redirect`

</TabItem>


<TabItem value="Facebook" title="Facebook">

<h4 id="facebook">Using ngrok</h4>

Facebook doesn't accept `localhost` urls. <br/>
Use `ngrok` to serve the backend app.

```
ngrok http 1337
```

Don't forget to update the server url in the backend config file `config/server.js` and the server url in your frontend app (environment variable `REACT_APP_BACKEND_URL` if you use [react login example app](https://github.com/strapi/strapi-examples/tree/master/examples/login-react)) with the generated ngrok url.

<h4 id="facebook-config">Facebook configuration</h4>

- Visit the Developer Apps list page <br/> [https://developers.facebook.com/apps/](https://developers.facebook.com/apps/)
- Click on **Add a New App** button
- Fill the **Display Name** in the modal and create the app
- Setup a **Facebook Login** product
- Click on the **PRODUCTS > Facebook login > Settings** link in the left menu
- Fill the information and save (replace with your own ngrok url):
  - **Valid OAuth Redirect URIs**: `https://65e60559.ngrok.io/api/connect/facebook/callback`
- Then, click on **Settings** in the left menu
- Then on **Basic** link
- You should see your Application ID and secret, save them for later

<h4 id="facebook-strapi-config">Strapi configuration</h4>

- Visit the User Permissions provider settings page <br/> [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
- Click on the **Facebook** provider
- Fill the information (replace with your own client ID and secret):
  - **Enable**: `ON`
  - **Client ID**: 2408954435875229
  - **Client Secret**: 4fe04b740b69f31ea410b9391ff3b5b0
  - **The redirect URL to your front-end app**: `http://localhost:3000/connect/facebook/redirect`

</TabItem>

<TabItem title="Google" value="Google">

<h4 id="google">Using ngrok</h4>

Google accepts the `localhost` urls. <br/>
The use of `ngrok` is not needed.

<h4 id="google-config">Google configuration</h4>

- Visit the Google Developer Console <br/> [https://console.developers.google.com/](https://console.developers.google.com/)
- Click on the **Select a project** dropdown in the top menu
- Then click **NEW PROJECT** button
- Fill the **Project name** input and create

Wait a few seconds while the application is created.

- On the project dropdown, select your new project
- Click on **Go to APIs overview** under the **APIs** card
- Then click on the **Credentials** link in the left menu
- Click on **OAuth consent screen** button
- Choose **External** and click on **create**
- Fill the **Application name** and save
- Then click on **Create credentials** button
- Choose **OAuth client ID** option
- Fill the information:
  - **Name**: `Strapi Auth`
  - **Authorized redirect URIs**: `http://localhost:1337/api/connect/google/callback`
- Click on **OAuth 2.0 Client IDs** name of the client you just created
- You should see your Application ID and secret, save them for later

<h4 id="google-strapi-config">Strapi configuration</h4>

- Visit the User Permissions provider settings page <br/> [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
- Click on the **Google** provider
- Fill the information (replace with your own client ID and secret):
  - **Enable**: `ON`
  - **Client ID**: 226437944084-o2mojv5i4lfnng9q8kq3jkf5v03avemk.apps.googleusercontent.com
  - **Client Secret**: aiTbMoiuJQflSBy6uQrfgsni
  - **The redirect URL to your front-end app**: `http://localhost:3000/connect/google/redirect`

</TabItem>

<TabItem title="AWS Cognito" value="AWS Cognito">

<h4 id="aws-cognito">Using ngrok</h4>

AWS Cognito accepts the `localhost` urls. <br/>
The use of `ngrok` is not needed.

<h4 id="aws-cognito-config">AWS Cognito configuration</h4>

- Visit the AWS Management Console <br/> [https://aws.amazon.com/console/](https://aws.amazon.com/console/)
- If needed, select your **Region** in the top right corner next to the Support dropdown
- Select the **Services** dropdown in the top left corner
- Click on **Cognito** in the `Security, Identity & Compliance` section
- Then click on the **Manage User Pools** button
- If applicable either create or use an existing user pool. You will find hereafter a tutorial to create a User Pool <br/> [https://docs.aws.amazon.com/cognito/latest/developerguide/tutorial-create-user-pool.html](https://docs.aws.amazon.com/cognito/latest/developerguide/tutorial-create-user-pool.html)
- Go to the **App clients** section in your cognito user pool and create a new client with the name `Strapi Auth` and set all the parameters and then click on **Create app client**
- You should now have an **App client id** and by clicking on the button **Show Details** you will be able to see the **App client secret**. Do copy those two values **App client id** and **App client secret** somewhere for later use when configuring the AWS Cognito provider in Strapi.
- Go to the **App integration section** and click on **App client settings**
- Look for your app client named `Strapi Auth` and enable Cognito User Pool by checking it in the **Enabled Identity Providers** section of your newly created App client
- Fill in your callback URL and Sign out URL with the value `http://localhost:1337/api/connect/cognito/callback` or the one provided by your AWS Cognito provider in Strapi
- In the **Oauth 2.0** section select `Authorization code grant` and `Implicit grant` for the **Allowed OAuth Flows** and select `email`, `openid` and `profile` for the **Allowed OAuth Scopes**
- You can now click on **Save changes** and if you have already configured your domain name then you should be able to see a link to the **Launch Hosted UI**. You can click on it in order to display the AWS Cognito login page. In case you haven't yet configured your domain name, use the link **Choose domain name** at the bottom right of the page in order to configure your domain name. On that page you will have an `Amazon Cognito Domain` section where a `Domain prefix` is already setup. Type a domain prefix to use for the sign-up and sign-in pages that are hosted by Amazon Cognito, this domain prefix together with the `.auth.YOUR_REGION.amazoncognito.com` will be the **Host URI (Subdomain)** value for your strapi configuration later on.

<h4 id="aws-cognito-strapi-config">Strapi configuration</h4>

- Visit the User Permissions provider settings page <br/> [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
- Click on the **Cognito** provider
- Fill the information (replace with your own client ID and secret):
  - **Enable**: `ON`
  - **Client ID**: fill in the **App client id** (`5bd7a786qdupjmi0b3s10vegdt`)
  - **Client Secret**: fill in the **App client secret** (`19c5c78dsfsdfssfsdfhpdb4nkpb145vesdfdsfsffgh7vwd6g45jlipbpb`)
  - **Host URI (Subdomain)**: fill in the URL value that you copied earlier (`myapp67b50345-67b50b17-local.auth.eu-central-1.amazoncognito.com`)
  - **The redirect URL to your front-end app**: if you are using strapi react-login [https://github.com/strapi/strapi-examples/tree/master/examples/login-react/](https://github.com/strapi/strapi-examples/tree/master/examples/login-react/) use `http://localhost:3000/connect/cognito/redirect` but if you do not yet have a front-end app to test your Cognito configuration you can then use the following URL `http://localhost:1337/api/auth/cognito/callback`

</TabItem>

<TabItem title="Twitter" value="Twitter">

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

</TabItem>

<TabItem title="Discord" value="Discord">

<h4 id="discord">Using ngrok</h4>

Discord accepts the `localhost` urls. <br/>
The use of `ngrok` is not needed.

<h4 id="discord-configuration">Discord configuration</h4>

- Visit the Apps list page on the developer portal <br/> [https://discordapp.com/developers/applications/](https://discordapp.com/developers/applications/)
- Click on **New application** button
- Fill the **name** and create
- Click on **OAuth2** in the left menu
- And click on **Add redirect** button
- Fill the **Redirect** input with `http://localhost:1337/api/connect/discord/callback` URL and save
- Click on **General information** in the left menu
- You should see your Application ID and secret, save them for later

<h4 id="discord-strapi-configuration">Strapi configuration</h4>

- Visit the User Permissions provider settings page <br/> [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
- Click on the **Discord** provider
- Fill the information (replace with your own client ID and secret):
  - **Enable**: `ON`
  - **Client ID**: 665118465148846081
  - **Client Secret**: iJbr7mkyqyut-J2hGvvSDch_5Dw5U77J
  - **The redirect URL to your front-end app**: `http://localhost:3000/connect/discord/redirect`

</TabItem>

<TabItem title="Twitch" value="Twitch">

<h4 id="twitch">Using ngrok</h4>

Twitch accepts the `localhost` urls. <br/>
The use of `ngrok` is not needed.

<h4 id="twitch-config">Twitch configuration</h4>

- Visit the Apps list page on the developer console <br/> [https://dev.twitch.tv/console/apps](https://dev.twitch.tv/console/apps)
- Click on **Register Your Application** button
- Fill the information:
  - **Name**: Strapi auth
  - **OAuth Redirect URLs**: `http://localhost:1337/api/connect/twitch/callback`
  - **Category**: Choose a category
- Click on **Manage** button of your new app
- Generate a new **Client Secret** with the **New Secret** button
- You should see your Application ID and secret, save them for later

<h4 id="twitch-strapi-config">Strapi configuration</h4>

- Visit the User Permissions provider settings page <br/> [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
- Click on the **Twitch** provider
- Fill the information (replace with your own client ID and secret):
  - **Enable**: `ON`
  - **Client ID**: amuy279g8wt68qlht3u4gek4oykh5j
  - **Client Secret**: dapssh10uo97gg2l25qufr8wen3yr6
  - **The redirect URL to your front-end app**: `http://localhost:3000/connect/twitch/redirect`

</TabItem>

<TabItem title="Instagram" value="Instagram">

<h4 id="instagram">Using ngrok</h4>

Facebook doesn't accept `localhost` urls. <br/>
Use `ngrok` to serve the backend app.

```
ngrok http 1337
```

Don't forget to update the server url in the backend config file `config/server.js` and the server url in your frontend app (environment variable `REACT_APP_BACKEND_URL` if you use [react login example app](https://github.com/strapi/strapi-examples/tree/master/login-react)) with the generated ngrok url.

<h4 id="instagram-config">Instagram configuration</h4>

- Visit the Developer Apps list page <br/> [https://developers.facebook.com/apps/](https://developers.facebook.com/apps/)
- Click on **Add a New App** button
- Fill the **Display Name** in the modal and create the app
- Setup an **Instagram** product
- Click on the **PRODUCTS > Instagram > Basic Display** link in the left menu
- Then click on the **Create new application** button (and valid the modal)
- Fill the information (replace with your own ngrok url):
  - **Valid OAuth Redirect URIs**: `https://65e60559.ngrok.io/api/connect/instagram/callback`
  - **Deauthorize**: `https://65e60559.ngrok.io`
  - **Data Deletion Requests**: `https://65e60559.ngrok.io`
- On the **App Review for Instagram Basic Display** click on **Add to submission** for **instagram_graph_user_profile**.
- You should see your Application ID and secret, save them for later

<h4 id="instagram-strapi-config">Strapi configuration</h4>

- Visit the User Permissions provider settings page <br/> [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
- Click on the **Instagram** provider
- Fill the information (replace with your own client ID and secret):
  - **Enable**: `ON`
  - **Client ID**: 563883201184965
  - **Client Secret**: f5ba10a7dd78c2410ab6b8a35ab28226
  - **The redirect URL to your front-end app**: `http://localhost:3000/connect/instagram/redirect`

</TabItem>

<TabItem title="VK" value="VK">

<h4 id="vk">Using ngrok</h4>

VK accepts the `localhost` urls. <br/>
The use of `ngrok` is not needed.

<h4 id="vk-config">VK configuration</h4>

- Visit the Apps list page <br/> [https://vk.com/apps?act=manage](https://vk.com/apps?act=manage)
- Click on **Create app** button
- Fill the information:
  - **Title**: Strapi auth
  - **Platform**: Choose **Website** option
  - **Website address**: `http://localhost:1337`
  - **Base domain**: `localhost`
- Click on the **Settings** link in the left menu
- Click on the **Open API** link to enable this option
- Fill the information:
  - **Authorized redirect URL**: `http://localhost:1337/api/connect/vk/callback`

<h4 id="vk-strapi-config">Strapi configuration</h4>

- Visit the User Permissions provider settings page <br/> [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
- Click on the **VK** provider
- Fill the information:
  - **Enable**: `ON`
  - **Client ID**: 7276416
  - **Client Secret**: cFBUSghLXGuxqnCyw1N3
  - **The redirect URL to your front-end app**: `http://localhost:3000/connect/vk/redirect`

</TabItem>

<TabItem title="LinkedIn" value="LinkedIn">

<h4 id="linkedin">Using ngrok</h4>

LinkedIn accepts the `localhost` urls. <br/>
The use of `ngrok` is not needed.

<h4 id="linkedin-config">LinkedIn configuration</h4>

- Visit the Apps list page <br/> [https://www.linkedin.com/developers/apps](https://www.linkedin.com/developers/apps)
- Click on **Create app** button
- Fill the information:
  - **App name**: Strapi auth
  - **LinkedIn Page**: Enter a LinkedIn page name to associate with the app or click **Create a new LinkedIn Page** to create a new one
  - **App Logo**: Upload a square image that is at least 100x100 pixels.
- Click on the **Create app** to create the app
- On the app page click on **Auth** tab
- Fill the information:
  - **Authorized redirect URL**: `http://localhost:1337/api/connect/linkedin/callback`
- On the app page click on **Products** tab.
- Select `Sign In with LinkedIn` from the product list to enable it.

<h4 id="linkedin-strapi-config">Strapi configuration</h4>

- Visit the User Permissions provider settings page <br/> [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
- Click on the **LinkedIn** provider
- Fill the information:
  - **Enable**: `ON`
  - **Client ID**: 84witsxk641rlv
  - **Client Secret**: HdXO7a7mkrU5a6WN
  - **The redirect URL to your front-end app**: `http://localhost:3000/connect/linkedin/redirect`

</TabItem>

<TabItem title="CAS" value="CAS">

<h4 id="cas">Using ngrok</h4>

A remote CAS server can be configured to accept `localhost` URLs or you can run your own CAS server locally that accepts them.

The use of `ngrok` is not needed.

<h4 id="cas-config">CAS configuration</h4>

- [CAS](https://github.com/apereo/cas) is an SSO server that supports many different methods of verifying a users identity,
  retrieving attributes out the user and communicating that information to applications via protocols such as SAML, OIDC, and the CAS protocol. Strapi can use a CAS server for authentication if CAS is deployed with support for OIDC.
- [CAS](https://github.com/apereo/cas) could already be used by your company or organization or you can setup a local CAS server by cloning the [CAS Overlay](https://github.com/apereo/cas-overlay-template) project or using the newer [CAS Initializr](https://github.com/apereo/cas-initializr) to create an overlay project.
- The CAS server must be configured so it can act as an [OpenID Connect Provider](https://apereo.github.io/cas/6.6.x/installation/OIDC-Authentication.html)
- CAS version 6.3.x and higher is known to work with Strapi but older versions that support OIDC may work.
- Define a CAS OIDC service for Strapi and store it in whichever CAS service registry is being used.
- The CAS service definition might look something like this for a local strapi deployment:

```json
{
  "@class": "org.apereo.cas.services.OidcRegisteredService",
  "clientId": "thestrapiclientid",
  "clientSecret": "thestrapiclientsecret",
  "bypassApprovalPrompt": true,
  "serviceId": "^http(|s)://localhost:1337/.*",
  "name": "Local Strapi",
  "id": 20201103,
  "evaluationOrder": 50,
  "attributeReleasePolicy": {
    "@class": "org.apereo.cas.services.ReturnMappedAttributeReleasePolicy",
    "allowedAttributes": {
      "@class": "java.util.TreeMap",
      "strapiemail": "groovy { return attributes['mail'].get(0) }",
      "strapiusername": "groovy { return attributes['username'].get(0) }"
    }
  }
}
```

<h4 id="cas-strapi-config">Strapi configuration</h4>

- Visit the User Permissions provider settings page <br/> [http://localhost:1337/admin/plugins/users-permissions/providers](http://localhost:1337/admin/plugins/users-permissions/providers)
- Click on the **Cas** provider
- Fill the information:
  - **Enable**: `ON`
  - **Client ID**: thestrapiclientid
  - **Client Secret**: thestrapiclientsecret
  - **The redirect URL to your front-end app**: `http://localhost:1337/api/connect/cas/redirect`
  - **The Provider Subdomain such that the following URLs are correct for the CAS deployment you are targeting:**
  ```
    authorize_url: https://[subdomain]/oidc/authorize
    access_url: https://[subdomain]/oidc/token
    profile_url: https://[subdomain]/oidc/profile
  ```
  For example, if running CAS locally with a login URL of: `https://localhost:8443/cas/login`, the value for the provider subdomain would be `localhost:8443/cas`.

</TabItem>

<TabItem title="Reddit" value="Reddit">

<h4 id="reddit">Using ngrok</h4>

Reddit accepts the `localhost` urls. <br/>
The use of `ngrok` is not needed.

<h4 id="reddit-config">Reddit configuration</h4>

- Visit the Reddit authorized applications preferences page <br/> [https://www.reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
- Click on the **create another app...** button near the bottom
- Select **web app** for the type
- Fill the **name** and **redirect uri** input in
- Click the **create app** button
- Note that the **Client ID** is located under the app type (web app)

<h4 id="reddit-strapi-config">Strapi configuration</h4>

- Visit the User Permissions provider settings page <br/> [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
- Click on the **Reddit** provider
- Fill the information (replace with your own client ID and secret):
  - **Enable**: `ON`
  - **Client ID**: hmxSBOit0SCjSQ
  - **Client Secret**: gwR9hCjK_PMYVYNGeDLS4WLB8g7xqg
  - **The redirect URL to your front-end app**: `http://localhost:3000/connect/reddit/redirect`

</TabItem>

<TabItem title="Auth0" value="Auth0">

<h4 id="auth0">Using ngrok</h4>

Auth0 accepts the `localhost` urls. <br/>
The use of `ngrok` is not needed.

<h4 id="auth0-config">Auth0 configuration</h4>

- Visit your Auth0 tenant dashboard
- In API section, create a new API
- In application, create a `machine-to-machine` application and select the API that you have just created
- In settings of this app set these values:
  - **Allowed Callback URLs**: `http://localhost:1337/api/connect/auth0/callback`
  - **Allowed Logout URLs**: `http://localhost:3000`
  - **Allowed Web Origins**: `http://localhost:3000`
- At the bottom of settings, show "Advanced Settings" and go to the "Grant Types". Ensure that these grants are checked/enabled:
  - Implicit
  - Authorization Code
  - Refresh Token
  - Client Credentials

<h4 id="auth0-strapi-config">Strapi configuration</h4>

- Visit the User Permissions provider settings page <br/> [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
- Click on the **Auth0** provider
- Fill the information:
  - Enable: `ON`
  - Client ID: `<Your Auth0 Client ID>`
  - Client Secret: `<Your Auth0 Client Secret>`
  - Subdomain: `<Your Auth0 tenant url>`, example it is the part in bold in the following url: https://**my-tenant.eu**.auth0.com/
  - The redirect URL to your front-end app: `http://localhost:3000/connect/auth0`

</TabItem>

<TabItem value="Patreon" label="Patreon">

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

</TabItem>

<TabItem title="Keycloak" value="Keycloak">

<h4 id="keycloak">Using ngrok</h4>

Keycloak accepts the `localhost` urls. <br/>
The use of `ngrok` is not needed.

<h4 id="keycloak-config">Keycloak configuration</h4>

- Visit your Keycloak admin dashboard
- If you don't already have a realm, you'll want to create one
- In the Clients section of your realm, create a new client
- Under the capability config, ensure you set `Client Authentication` to on to ensure you can create a private key
- Under the access settings, ensure you set the following values:
  - **Valid redirect URIs**: `http://localhost:1337/api/connect/keycloak/callback` and `http://localhost:1337/api/connect/keycloak`
  - **Allowed Web Origins**: `http://localhost:3000` and `http://localhost:1337`
- In the Client Scopes section, ensure you have the `email` and `profile` scopes set to default
- In the Client Scopes section, ensure you have the `openid` scope set to default, if you don't have this you will need to manually create it in the global Client Scopes

<h4 id="keycloak-strapi-config">Strapi configuration</h4>

- Visit the User Permissions provider settings page <br/> [http://localhost:1337/admin/settings/users-permissions/providers](http://localhost:1337/admin/settings/users-permissions/providers)
- Click on the **Keycloak** provider
- Fill the information:
  - Enable: `ON`
  - Client ID: `<Your Keycloak Client ID>`
  - Client Secret: `<Your Keycloak Client Secret>`
  - Subdomain: `<Your Keycloak realm url>`, example is either `keycloak.example.com/realms/strapitest` or `keycloak.example.com/auth/realms/strapitest` **without the protocol before it**
  - The redirect URL to your front-end app: `http://localhost:3000/connect/keycloak/redirect`
  - (Optional) Set the JWKS URL if you have a custom JWKS URL, example is like `https://keycloak.example.com/auth/realms/strapitest/protocol/openid-connect/certs`

</TabItem>
</Tabs>

Your configuration is done.
Launch the backend and the [react login example app](https://github.com/strapi/strapi-examples/tree/master/examples/login-react), go to `http://localhost:3000` and try to connect to the provider your configured.

##### Creating a custom provider

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

#### Setup the frontend

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

## User object in Strapi context

The `user` object is available to successfully authenticated requests.

The authenticated `user` object is a property of `ctx.state`.

```js
create: async ctx => {
  const { id } = ctx.state.user;

  const depositObj = {
    ...ctx.request.body,
    depositor: id,
  };

  const data = await strapi.services.deposit.add(depositObj);

  // Send 201 `created`
  ctx.created(data);
};
```

<!-- Needs to be updated to v4>

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
-->

## Templating emails

By default this plugin comes with two templates: reset password and email address confirmation. The templates use Lodash's `template()` method to populate the variables.

You can update these templates under **Plugins** > **Roles & Permissions** > **Email Templates** tab in the admin panel.

### Reset Password

- `USER` (object)
  - `username`
  - `email`
- `TOKEN` corresponds to the token generated to be able to reset the password.
- `URL` is the link where the user will be redirected after clicking on it in the email.
- `SERVER_URL` is the absolute server url (configured in server configuration).

### Email address confirmation

- `USER` (object)
  - `username`
  - `email`
- `CODE` corresponds to the CODE generated to be able confirm the user email.
- `URL` is the Strapi backend URL that confirms the code (by default `/auth/email-confirmation`).
- `SERVER_URL` is the absolute server url (configured in server configuration).

## Security configuration

JWTs can be verified and trusted because the information is digitally signed. To sign a token a _secret_ is required. By default Strapi generates and stores it in `./extensions/users-permissions/config/jwt.js`.

This is useful during development but for security reasons it is recommended to set a custom token via an environment variable `JWT_SECRET` when deploying to production.

By default you can set a `JWT_SECRET` environment variable and it will be used as secret. If you want to use another variable you can update the configuration file.

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./extensions/users-permissions/config/jwt.js"

module.exports = {
  jwtSecret: process.env.SOME_ENV_VAR,
};
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./extensions/users-permissions/config/jwt.ts"

export default {
  jwtSecret: process.env.SOME_ENV_VAR,
};
```

</TabItem>

</Tabs>

:::tip
You can learn more about configuration [here](/dev-docs/configurations).
:::

### Creating a custom callback validator

By default, Strapi SSO only redirects to the redirect URL that is exactly equal to the url in the configuration:

<ThemedImage
  alt="Users & Permissions configuration"
  sources={{
      light: '/img/assets/users-permissions/sso-config-custom-validator.png',
      dark: '/img/assets/users-permissions/sso-config-custom-validator_DARK.png'
    }}
/>

If you need to configure a custom handler to accept other URLs, you can create a callback `validate` function in your plugins.js for the `users-permissions` plugin.

```tsx title="/config/plugins.js|ts"
  // ... other plugins configuration ...
  // Users & Permissions configuration
  'users-permissions': {
    enabled: true,
    config: {
      callback: {
        validate: (cbUrl, options) => {
          // cbUrl is where Strapi is being asked to redirect the auth info
          // that was received from the provider to

          // in this case, we will only validate that the 
          // if using a base url, you should always include the trailing slash
          // although in real-world usage you should also include the full paths
          if (cbUrl.startsWith('https://myproxy.mysite.com/') || 
              cbUrl.startsWith('https://mysite.com/')) {
            return;
          }

          // Note that you MUST throw an error to fail validation
          // return values are not checked
          throw new Error('Invalid callback url');
        },
      },
    },
  },
```
