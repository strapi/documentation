---
title: Users & Permissions
description: Learn to use the Users & Permissions and API tokens features to manage end-users.
toc_max_heading_level: 5
tags:
- admin panel
- users & permissions
- api tokens
- features
---

# Users & Permissions

The Users & Permissions feature allows the management of the end-users <Annotation>💡 **What are end users?** <br/> End-users are the users who consume the content that is created and managed with a Strapi application and displayed on front-end applications (e.g. websites, mobile applications, connected devices etc.). Unlike the administrators, they do not have access to the admin panel.</Annotation> of a Strapi project. It provides a full authentication process based on JSON Web Tokens (JWT) to protect your API, and an access-control list (ACL) strategy that enables you to manage permissions between groups of users.

<IdentityCard>
  <IdentityCardItem icon="credit-card" title="Plan">Free feature</IdentityCardItem>
  <IdentityCardItem icon="user" title="Role & permission">CRUD permissions in Roles > Plugins - Users & Permissions</IdentityCardItem>
  <IdentityCardItem icon="toggle-right" title="Activation">Available by default</IdentityCardItem>
  <IdentityCardItem icon="desktop" title="Environment">Available in both Development & Production environment</IdentityCardItem>
</IdentityCard>

## Admin panel configuration

The Users & Permissions feature is configured from both the admin panel settings, and via the code base.

### Roles

The Users & Permissions feature allows to create and manage roles for end users, to configure what they can have access to.

#### Creating a new role

**Path:** <Icon name="gear-six" /> *Users & Permissions plugin > Roles*

On the top right side of the *Roles* interface, an **Add new role** button is displayed. It allows to create a new role for end users of your Strapi application.

Click on the **Add new role** button to be redirected to the roles edition interface, where you will be able to name your new role and define its details and permissions (see [Editing a role](#editing-a-role)).

<ThemedImage
  alt="End-users roles interface"
  sources={{
    light: '/img/assets/users-permissions/end-user_roles.png',
    dark: '/img/assets/users-permissions/end-user_roles_DARK.png',
  }}
/>

:::note
The end-user role attributed by default to all new end users can be defined in the *Advanced settings* sub-section of *Users & Permissions plugin* (see [Advanced settings](#advanced-settings)).
:::

#### Editing a role

**Path:** <Icon name="gear-six" /> *Users & Permissions plugin > Roles*

The *Roles* interface displays all created roles for the end users of your Strapi application.

By default, 2 end-user roles are defined for any Strapi application:

- Authenticated: for end users to access content only if they are logged in to a front-end application.
- Public: for end users to access content without being logged in to a front-end application.

More roles can however be created (see [Creating a new role](#creating-a-new-role)), and all can be edited through the role edition interface.

1. Click on the edit button <Icon name="pencil-simple" /> of the role to edit — except if you directly landed on the role edition interface from creating a new role.
2. Fill in the *Role details*, following the instructions from the table below:

| Role details  | Instructions |
| ------------- | ---------------------------------------- |
| Name          | Write the new name of the role in the textbox. |
| Description   | Write the description of the role in the textbox. It should help administrators understand what the role gives access to. |

3. Configure the end-user role's *Permissions* by:
    1. Clicking on the name of the permission category to configure (e.g. Application, Content-Manager, Email etc.).
    2. Ticking the boxes of the actions and permissions to grant for the role.
4. Click on the **Save** button.

:::tip
When ticking an action or permission box, related bound routes of the API are displayed in the right side of the interface.
:::

<ThemedImage
  alt="Configuring a role for end users"
  sources={{
    light: '/img/assets/users-permissions/end-user_roles-config.png',
    dark: '/img/assets/users-permissions/end-user_roles-config_DARK.png',
  }}
/>

#### Deleting a role

**Path:** <Icon name="gear-six" /> *Users & Permissions plugin > Roles*

Although the 2 default end-user roles cannot be deleted, the other ones can, as long as no end user still has this role attributed to their account.

1. Click on the delete button <Icon name="trash" /> on the right side of the role's record.
2. In the deletion window, click on the <Icon name="trash" /> **Confirm** button to confirm the deletion.

### Providers

**Path:** <Icon name="gear-six" /> *Users & Permissions plugin > Providers*

The Users & Permissions feature allows enabling and configuring providers, for end users to login via a third-party provider to access the content of a front-end application through the Strapi application API.

By default, a list of providers is available including one, "Email", enabled by default for all Strapi applications with Users & Permissions enabled.

1. Click on the edit <Icon name="pencil-simple" /> button of the provider to enable and configure.
2. In the provider edition window, click on the **TRUE** button of the *Enable* option.
3. Fill in the provider's configurations. Each provider has its own specific set of configurations (see [Users & Permissions providers documentation](/cms/configurations/users-and-permissions-providers#setting-up-the-provider---examples)).
4. Click on the **Save** button.

<ThemedImage
  alt="Providers interface"
  sources={{
    light: '/img/assets/settings/up_providers.png',
    dark: '/img/assets/settings/up_providers_DARK.png',
  }}
/>

Other providers that are not proposed by default by Strapi can be added manually through the code of your Strapi application. Click on any of the following cards to get additional information on configuring or creating third-party providers:

<CustomDocCardsWrapper>
<CustomDocCard icon="question" title="Setting up providers" description="Learn how Users & Permissions providers work, understand the login flow, and see common examples." link="/cms/configurations/users-and-permissions-providers" />
<CustomDocCard icon="list-plus" title="Creating a custom provider" description="Learn how to create your own custom provider for the Users & Permissions feature." link="/cms/configurations/users-and-permissions-providers/new-provider-guide" />
</CustomDocCardsWrapper>


<!---
:::tip
Click the search button <Icon name="search" classes="ph-bold" /> above the table to use a text search and find one of your providers more quickly!
:::
--->

### Email templates

**Path:** <Icon name="gear-six" /> *Users & Permissions plugin > Email templates*

The Users & Permissions feature uses 2 email templates, "Email address confirmation" and "Reset password", that are sent to end users:

- if their account must be confirmed to be activated,
- if they need to reset the password of their Strapi account.

Both email templates can be modified.

1. Click on the edit <Icon name="pencil-simple" /> button of the email template to configure and edit.
2. Configure the email template:
    | Setting name   | Instructions |
    |--------------- | ----------------------------------------------- |
    | Shipper name   | Indicate the name of the shipper of the email.                                                   |
    | Shipper email  | Indicate the email address of the shipper of the email.                                          |
    | Response email | (optional) Indicate the email address to which responses emails from the end users will be sent. |
    | Subject        | Write the subject of the email. Variables can be used (see [templating emails](#templating-emails)).             |
3. Edit the content of the email in the "Message" textbox. Email templates content is in HTML and uses variables (see [templating emails](#templating-emails)).
4. Click on the **Finish** button.

<ThemedImage
  alt="Email templates interface"
  sources={{
    light: '/img/assets/settings/up_email-templates.png',
    dark: '/img/assets/settings/up_email-templates_DARK.png',
  }}
/>

### Advanced Settings

**Path:** <Icon name="gear-six" /> *Users & Permissions plugin > Advanced settings*

All settings related to the Users & Permissions feature are managed from the *Advanced Settings* interface, including the choice of a default role for end users, the enablement of sign-ups and email confirmation, as well as the choice of landing page for resetting a password.

1. Configure the settings of your choice, following the instructions below:
    | Setting name  | Instructions         |
    | ------------------------------------ | --------------------------------------------------------------|
    | Default role for authenticated users | Click the drop-down list to choose the default role for new end users.                                                                                             |
    | One account per email address        | Click on the **TRUE** button to limit to 1 the number of end-user accounts with the same email address.<br/>Click on **FALSE** to disable this limitation and allow several end-user accounts to be associated with the same email address (e.g. `kai.doe@strapi.io` can be used when logging in via several different providers).  |
    | Enable sign-ups                      | Click on the **TRUE** button to enable end-user sign-ups.<br/>Click on **FALSE** to prevent end-user registration to your front-end application(s).                        |
    | Reset password page                  | Indicate the URL of the reset password page for your front-end application(s).                                                                                     |
    | Enable email confirmation            | Click on the **TRUE** button to enable end-user account confirmation by sending them a confirmation email.<br/>Click on **FALSE** to disable account confirmation.         |
    | Redirection url                      | Indicate the URL of the page where end users should be redirected after confirming their Strapi account.                                                           |

2. Click the **Save** button.

<ThemedImage
  alt="Advanced settings interface"
  sources={{
    light: '/img/assets/settings/up_settings.png',
    dark: '/img/assets/settings/up_settings_DARK.png',
  }}
/>

## Code-based configuration

While most of the Users & Permissions settings are handled via the admin panel, some more specific settings can be fine-tuned by configuring and customizing your Strapi project's code.

### JWT configuration

You can configure the JWT generation by using the [plugins configuration file](/cms/configurations/plugins).

Strapi uses <ExternalLink to="https://www.npmjs.com/package/jsonwebtoken" text="jsonwebtoken"/> to generate the JWT.

Available options:

- `jwtSecret`: random string used to create new JWTs, typically set using the `JWT_SECRET` [environment variable](/cms/configurations/environment#strapi).
- `jwt.expiresIn`: expressed in seconds or a string describing a time span.<br/>
  Eg: 60, "45m", "10h", "2 days", "7d", "2y". A numeric value is interpreted as a seconds count. If you use a string be sure you provide the time units (minutes, hours, days, years, etc), otherwise milliseconds unit is used by default ("120" is equal to "120ms").

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/plugins.js"

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

```ts title="/config/plugins.ts"

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
Setting JWT expiry for more than 30 days is not recommended due to security concerns.
:::

### Registration configuration

If you have added any additional fields in your User **model** <Annotation>Models, also called content-types in Strapi, define a representation of the content structure.<br/>Users are a special type of built-in content-type found in any new Strapi application. You can customize the Users model, adding more fields for instance, like any other models.<br/>For more information, please refer to the [models](/cms/backend-customization/models) documentation.</Annotation> that need to be accepted on registration, you need to added them to the list of allowed fields in the `config.register` object of [the `/config/plugins` file](/cms/configurations/plugins), otherwise they will not be accepted.

The following example shows how to ensure a field called "nickname" is accepted by the API on user registration:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/plugins.js"
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

```ts title="/config/plugins.ts"
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

### Templating emails

By default this plugin comes with two templates: reset password and email address confirmation. The templates use <ExternalLink to="https://lodash.com/docs/4.17.15#template" text="Lodash's `template()` method"/> to populate the variables.

You can update these templates under **Plugins** > **Roles & Permissions** > **Email Templates** tab in the admin panel (see [configuring email templates](#email-templates)).

The following variables can be used:

<Tabs>
<TabItem value="reset-password" label="Reset password">

<br/>
- `USER` (object)
  - `username`
  - `email`
- `TOKEN` corresponds to the token generated to be able to reset the password.
- `URL` is the link where the user will be redirected after clicking on it in the email.
- `SERVER_URL` is the absolute server url (configured in server configuration).

</TabItem>

<TabItem value="email-address-confirmation" label="Email address confirmation">

<br/>
- `USER` (object)
  - `username`
  - `email`
- `CODE` corresponds to the CODE generated to be able confirm the user email.
- `URL` is the Strapi backend URL that confirms the code (by default `/auth/email-confirmation`).
- `SERVER_URL` is the absolute server url (configured in server configuration).

</TabItem>

</Tabs>

### Security configuration

JWTs can be verified and trusted because the information is digitally signed. To sign a token a _secret_ is required. By default Strapi generates and stores it in `/extensions/users-permissions/config/jwt.js`.

This is useful during development but for security reasons it is recommended to set a custom token via an environment variable `JWT_SECRET` when deploying to production.

By default you can set a `JWT_SECRET` environment variable and it will be used as secret. If you want to use another variable you can update the configuration file.

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/extensions/users-permissions/config/jwt.js"

module.exports = {
  jwtSecret: process.env.SOME_ENV_VAR,
};
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="/extensions/users-permissions/config/jwt.ts"

export default {
  jwtSecret: process.env.SOME_ENV_VAR,
};
```

</TabItem>

</Tabs>

#### Creating a custom callback validator {#creating-a-custom-password-validation}

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

## Usage

The Users & Permissions feature can be used both via the admin panel, to create new end-user accounts, and via the APIs.

### Admin panel usage

**Path to use the feature:** <Icon name="feather" /> Content Manager

With the Users & Permissions feature, the end users and their account information are managed as a content-type. When Users & Permissions is installed on a Strapi application, 3 collection types are automatically created, including "User" which is the only one available directly in the Content Manager.

<ThemedImage
  alt="Managing end users via the Content Manager"
  sources={{
    light: '/img/assets/users-permissions/end-user_content-manager.png',
    dark: '/img/assets/users-permissions/end-user_content-manager_DARK.png',
  }}
/>

Registering new end users in a front-end application with the Users & Permissions plugin consists in adding a new entry to the User collection type.

1. Go to the User collection type in the <Icon name="feather" /> Content Manager.
2. Click on the **Create new entry** button in the top right corner.
3. Fill in the default fields of the entry. Additional fields added specifically for your Strapi application by your administrators may be displayed as well.
    | Field     | Instructions    |
    | --------- | ---------------------------- |
    | Username  | Write the username of the end user.    |
    | Email     | Write the complete email address of the end user in the textbox.   |
    | Password  | (optional) Write a new password in the textbox. You can click on the <Icon name="eye" /> icon for the password to be shown. |
    | Confirmed | (optional) Click **ON** for the end-user account to be confirmed.                                           |
    | Blocked   | (optional) Click **ON** to block the account of the end user, to prevent them to access content.            |
    | Role      | (optional) Indicate the role that should be granted to the new end user. If this field is not filled in, the end user will be attributed the role set as default (see "Default role" option in [advanced settings](#advanced-settings)). |
4. Click on the **Save** button.

:::note
If end users can register themselves on your front-end application (see "Enable signups" option in [advanced settings](#advanced-settings)), a new entry will automatically be created and the fields of that entry will be filled up with the information indicated by the end user. All fields can however be edited by an administrator of the Strapi application.
:::

### API usage

Each time an API request is sent the server checks if an `Authorization` header is present and verifies if the user making the request has access to the resource.

:::note
When you create a user without a role, or if you use the `/api/auth/local/register` route, the `authenticated` role is given to the user.
:::

#### Identifier

The `identifier` param can be an email or username, as in the following examples:

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

#### Token usage

The `jwt` may then be used for making permission-restricted API requests. To make an API request as a user place the JWT into an `Authorization` header of the `GET` request.

Any request without a token will assume the `public` role permissions by default. Modify the permissions of each user's role in the admin dashboard.

Authentication failures return a `401 (unauthorized)` error.

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

#### User registration

Creating a new user in the database with a default role as 'registered' can be done like in the following example:

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

#### User object in Strapi context

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
