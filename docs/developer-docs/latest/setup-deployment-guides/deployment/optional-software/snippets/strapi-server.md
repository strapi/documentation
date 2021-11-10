### Strapi Server

In order to take full advantage of a proxied Strapi application you will need to configure Strapi to make it aware of the upstream proxy. Like with the below configurations there are 3 matching examples. To read more about the server and admin configuration files please see the [server configuration](/developer-docs/latest/setup-deployment-guides/configurations/required/server.md) and [admin configuration](/developer-docs/latest/setup-deployment-guides/configurations/required/admin-panel.md).

:::note API Prefix
Note that in many of these examples we are using the default API Prefix of `/api`, this can be changed without the need to directly modify the Nginx configuration, please see the [API Prefix](/developer-docs/latest/setup-deployment-guides/configurations/optional/api.md) documentation for more information.
:::

:::note Admin URL
If `url` key is changed in the `./config/admin.js` or `./config/server.js` files, the admin panel needs to be rebuilt with `yarn build` or `npm run build`.
:::

::::: tabs card

:::: tab Sub-Domain

#### Sub-Domain Strapi config

---

- Example Domain: `api.example.com`
- Example Admin: `api.example.com/admin`
- Example API: `api.example.com/api`
- Example Uploaded Files (local provider): `api.example.com/uploads`

**Path —** `config/server.js`

```js
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: 'https://api.example.com',
});
```

::::

:::: tab Sub-Folder-Unified

#### Sub-Folder Unified Strapi config

---

- Example Domain: `example.com/test`
- Example Admin: `example.com/test/admin`
- Example API: `example.com/test/api`
- Example Uploaded Files (local provider): `example.com/test/uploads`

**Path —** `config/server.js`

```js
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: 'https://example.com/test',
});
```

::::

:::: tab Sub-Folder-Split

#### Sub-Folder Split Strapi config

---

- Example Domain: `example.com`
- Example Admin: `example.com/dashboard`
- Example API: `example.com/api`
- Example Uploaded Files (local provider): `example.com/uploads`

**Path —** `config/server.js`

```js
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: 'https://example.com',
});
```

**Path —** `config/admin.js`

```js
module.exports = ({ env }) => ({
  auth: {
    ...
  }
  url: 'https://example.com/dashboard',
});
```

::::

:::::
