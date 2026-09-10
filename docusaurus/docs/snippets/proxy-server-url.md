The `url` option in the server configuration defines the public address of your application. Strapi uses it to build absolute URLs for password reset emails, third-party login providers, and media asset paths.

Set it to the address your application's visitors use in their browser:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="/config/server.js"
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', 'https://api.example.com'),
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
  app: {
    keys: env.array('APP_KEYS'),
  },
});
```

</TabItem>
</Tabs>
