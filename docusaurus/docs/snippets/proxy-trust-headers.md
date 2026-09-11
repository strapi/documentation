Enable proxy support through the `proxy` options in the server configuration:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/config/server.js"
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', 'https://api.example.com'),
  // highlight-start
  proxy: {
    koa: true,
    maxIpsCount: 1,
  },
  // highlight-end
  app: {
    keys: env.array('APP_KEYS'),
  },
});
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts title="/config/server.ts"
export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', 'https://api.example.com'),
  // highlight-start
  proxy: {
    koa: true,
    maxIpsCount: 1,
  },
  // highlight-end
  app: {
    keys: env.array('APP_KEYS'),
  },
});
```

</TabItem>
</Tabs>

Each option plays a different role:

| Option | Effect |
|--------|--------|
| `proxy.koa` | When `true`, Strapi trusts the `X-Forwarded-*` headers. Client IP, protocol, and host are read from the proxy instead of the socket. |
| `proxy.maxIpsCount` | <VersionBadge version="5.52.0+" noTooltip /> Number of addresses to read from the end of the forwarded header chain. Set it to `1` for a single proxy, or to the number of proxies when requests pass through several. |
| `proxy.ipHeader` | <VersionBadge version="5.52.0+" noTooltip /> Header the client IP is read from. It defaults to `X-Forwarded-For`, so set it only when your proxy sends another header, such as `CF-Connecting-IP`. |
