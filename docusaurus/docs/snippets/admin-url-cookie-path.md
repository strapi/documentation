:::caution Cookie path must match
Since Strapi 5.51, the admin authentication cookie path defaults to `/admin` regardless of `url`. When you change `url`, also set [`auth.cookie.path`](/cms/configurations/admin-panel#cookie-configuration) to the same value. Otherwise the admin panel cannot read its own authentication cookie: the login request succeeds, every request after it is rejected, and the panel returns to the login page with no error.

```js title="/config/admin.js"
module.exports = ({ env }) => ({
  url: "/dashboard",
  auth: {
    cookie: {
      path: "/dashboard", // must match url
    },
  },
});
```

After changing `auth.cookie.path`, rebuild the admin panel before starting Strapi, as this value is inlined into the admin bundle at build time.
:::
