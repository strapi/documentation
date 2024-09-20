There are some optional configurations that you can set should it be necessary, for more information on available options please see the [Admin Configuration](/dev-docs/configurations/admin) documentation.

- **`url`**: The public facing URL of your Strapi administration panel. (e.g. `https://admin.example.com`)
- **`auth.domain`**: Setting a custom domain for cookie storage. (e.g. `.example.com`)

:::note
When deploying the admin panel to a different location or on a different subdomain, an additional configuration is required to set the common domain for the cookies. This is required to ensure the cookies are shared across the domains.
:::

:::caution
Deploying the admin and backend on entirely different unrelated domains is not possible at this time when using SSO due to restrictions in cross-domain cookies.
:::

<details>
  <summary>Admin Optional Configuration Example</summary>

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="./config/admin.js"

module.exports = ({ env }) => ({
  // ...
  url: env('PUBLIC_ADMIN_URL', 'https://admin.example.com'),
  auth: {
    domain: env("ADMIN_SSO_DOMAIN", ".example.com"),
    providers: [
      // ...
    ],
  },
  // ...
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="./config/admin.ts"

export default ({ env }) => ({
  // ...
  url: env('PUBLIC_ADMIN_URL', 'https://admin.example.com'),
  auth: {
    domain: env("ADMIN_SSO_DOMAIN", ".example.com"),
    providers: [
      // ...
    ],
  },
  // ...
});
```

</TabItem>
</Tabs>
</details>
