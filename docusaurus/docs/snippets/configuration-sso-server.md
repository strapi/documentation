The following server configurations are required when using SSO, for more information on available options please see the [Server Configuration](/dev-docs/configurations/server) documentation.

- **`url`**: The public facing URL of your Strapi application. (e.g. `https://api.example.com`)
- **`proxy.koa`**: Enabling trusted reverse proxy support. (`true`)

<details>
  <summary>Admin Required Configuration Example</summary>

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/server.js"

module.exports = ({ env }) => ({
  // ...
  url: env('PUBLIC_URL', 'https://api.example.com'),
  proxy: {
    koa: env.bool('TRUST_PROXY', true),
  },
  // ...
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/server.ts"

export default ({ env }) => ({
  // ...
  url: env('PUBLIC_URL', 'https://api.example.com'),
  proxy: {
    koa: env.bool('TRUST_PROXY', true),
  },
  // ...
});
```

</TabItem>
</Tabs>
</details>

There are also some optional configurations that you can set should it be necessary:

- **`proxy.global`**: If you are in a restricted network environment that requires a forward proxy (e.g Squid) for all outgoing requests. (e.g. `http://username:password@yourProxy:3128`)

<details>
  <summary>Admin Optional Configuration Example</summary>

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/server.js"

module.exports = ({ env }) => ({
  // ...
  url: env('PUBLIC_URL', 'https://api.example.com'),
  proxy: {
    koa: env.bool('TRUST_PROXY', true),
    global: env('GLOBAL_PROXY'),
  },
  // ...
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/server.ts"

export default ({ env }) => ({
  // ...
  url: env('PUBLIC_URL', 'https://api.example.com'),
  proxy: {
    koa: env.bool('TRUST_PROXY', true),
    global: env('GLOBAL_PROXY'),
  },
  // ...
});
```

</TabItem>
</Tabs>
</details>
