:::caution Cookie path must match
When you change `url`, you must also update [`auth.cookie.path`](/cms/configurations/admin-panel#cookie-configuration) to the same value. The cookie path defaults to `'/admin'` regardless of `url`, so if they differ, the browser will not send the authentication cookie to the new path and logins will silently fail.

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
