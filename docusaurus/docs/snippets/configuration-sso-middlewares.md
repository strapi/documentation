The following middleware configurations are required when using SSO, for more information on available options please see the [Middlewares Configuration](/dev-docs/configurations/middlewares) documentation.

- **`contentSecurityPolicy`**: Allows you to configure the Content Security Policy (CSP) for your Strapi application. This is used to prevent cross-site scripting attacks by allowing you to control what resources can be loaded by your application.

:::note
By default, Strapi security policy does not allow loading images from external URLs, so provider logos will not show up on the [login screen](/user-docs/intro#accessing-the-admin-panel) of the admin panel unless [a security exception is added](/dev-docs/configurations/middlewares#security) or you use a file uploaded directly on your Strapi application.
:::

<details>
  <summary>Middlewares Configuration Example</summary>

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```jsx title="./config/middlewares.js"
module.exports = [
  // ...
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            'cdn2.iconfinder.com', // Base URL of the provider's logo without the protocol
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            'cdn2.iconfinder.com', // Base URL of the provider's logo without the protocol
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  // ...
]
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts title="./config/middlewares.ts"
export default [
  // ...
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            'cdn2.iconfinder.com', // Base URL of the provider's logo without the protocol
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            'cdn2.iconfinder.com', // Base URL of the provider's logo without the protocol
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  // ...
]
```

</TabItem>
</Tabs>
</details>
