:::prerequisites
Stop the server before starting the upgrade.
:::

1. Upgrade all of the Strapi packages in the `package.json` to `4.0.6`:

```jsx
// path: package.json

{
  // ...
  "dependencies": {
    "@strapi/strapi": "4.0.6",
    "@strapi/plugin-users-permissions": "4.0.6",
    "@strapi/plugin-i18n": "4.0.6",
    "sqlite3": "5.0.2"
    // ...
  }
}

```

2. Save the edited `package.json` file.

3. Run either `yarn` or `npm install` to install the new version.

::: tip
If the operation doesn't work, try removing your `yarn.lock` or `package-lock.json`. If that doesn't help, remove the `node_modules` folder as well and try again.
:::