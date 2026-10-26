:::caution Strapi 5.51 to 5.58: cookie path must match
In Strapi 5.51 to 5.58, the admin authentication cookie path defaults to `/admin` regardless of `url`. If you use one of these versions and change `url`, also set [`auth.cookie.path`](/cms/configurations/admin-panel#cookie-configuration) to the same value. Otherwise the admin panel cannot read its own authentication cookie: the login request succeeds, every request after it is rejected, and the panel returns to the login page with no error.

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

Since Strapi 5.59, the cookie path derives from `url` automatically and this step is no longer needed.
:::
