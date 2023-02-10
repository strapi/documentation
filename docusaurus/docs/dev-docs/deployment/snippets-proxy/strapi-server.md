### Strapi server

In order to take full advantage of a proxied Strapi application, Strapi should be configured so it's aware of the upstream proxy. Like with the below configurations there are 3 matching examples. Additional information can be found in the [server configuration](/dev-docs/configurations/server) and [admin configuration](/dev-docs/configurations/admin-panel) documentations.

:::note
These examples use the default API Prefix of `/api`. This can be changed without the need to directly modify the Nginx configuration (see the [API prefix](/dev-docs/configurations/api) documentation).
:::

:::caution
If the `url` key is changed in the `./config/admin.js` or `./config/server.js` files, the admin panel needs to be rebuilt with `yarn build` or `npm run build`.
:::

<Tabs>

<TabItem value="Subdomain" label="Subdomain">

#### Subdomain Strapi configuration

---

- Example domain: `api.example.com`
- Example admin: `api.example.com/admin`
- Example API: `api.example.com/api`
- Example uploaded files (local provider): `api.example.com/uploads`

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="path: ./config/server.js"

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: 'https://api.example.com',
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="path: ./config/server.ts"

export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: 'https://api.example.com',
});
```

</TabItem>

</Tabs>

</TabItem>


<TabItem value="Subfolder unified" label="Subfolder unified">

#### Subfolder unified Strapi configuration

---

- Example domain: `example.com/test`
- Example admin: `example.com/test/admin`
- Example API: `example.com/test/api`
- Example uploaded Files (local provider): `example.com/test/uploads`

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="path: ./config/server.js"

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: 'https://example.com/test',
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="path: ./config/server.ts"

export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: 'https://example.com/test',
});
```

</TabItem>

</Tabs>

</TabItem>

</Tabs>
