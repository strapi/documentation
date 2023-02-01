### Strapi server

In order to take full advantage of a proxied Strapi application, Strapi should be configured so it's aware of the upstream proxy. Like with the following configurations there are 3 matching examples. Additional information can be found in the [server configuration](/developer-docs/latest/setup-deployment-guides/configurations/required/server.md) and [admin configuration](/developer-docs/latest/setup-deployment-guides/configurations/required/admin-panel.md) documentations.

:::note
These examples use the default API Prefix of `/api`. This can be changed without the need to directly modify the Nginx configuration (see the [API prefix](/developer-docs/latest/setup-deployment-guides/configurations/optional/api.md) documentation).
:::

:::caution
If the `url` key is changed in the `./config/admin.js` or `./config/server.js` files, the admin panel needs to be rebuilt with `yarn build` or `npm run build`.
:::

::::: tabs card

:::: tab Subdomain

#### Subdomain Strapi configuration

---

- Example domain: `api.example.com`
- Example admin: `api.example.com/admin`
- Example API: `api.example.com/api`
- Example uploaded files (local provider): `api.example.com/uploads`

<code-group>
<code-block title="JAVASCRIPT">

```js
// path: ./config/server.js

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: 'https://api.example.com',
});
```

</code-block>

<code-block title="TYPESCRIPT">

```js
// path: ./config/server.ts

export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: 'https://api.example.com',
});
```

</code-block>
</code-group>

::::

:::: tab Subfolder unified

#### Subfolder unified Strapi configuration

---

- Example domain: `example.com/test`
- Example admin: `example.com/test/admin`
- Example API: `example.com/test/api`
- Example uploaded Files (local provider): `example.com/test/uploads`

<code-group>
<code-block title="JAVASCRIPT">

```js
// path: ./config/server.js

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: 'https://example.com/test',
});
```

</code-block>

<code-block title="TYPESCRIPT">

```js
// path: ./config/server.ts

export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: 'https://example.com/test',
});
```

</code-block>
</code-group>

::::

:::::
