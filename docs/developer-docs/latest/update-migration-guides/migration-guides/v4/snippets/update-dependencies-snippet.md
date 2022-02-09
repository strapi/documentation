:::prerequisites
Stop the server before starting the upgrade. 
:::

Upgrade all of the Strapi packages in the `package.json` to `4.0.6`:

```jsx
// path: package.json
{
  // ...
  "dependencies": {
    "@strapi/plugin-documentation": "4.0.6",
    "@strapi/plugin-i18n": "4.0.6",
    "@strapi/plugin-users-permissions": "4.0.6",
    "@strapi/strapi": "4.0.6"
    // ...
  }
}

```
<!--:::: tabs card

::: tab 4.0.0

```json
{
  // ...
  "dependencies": {
    "@strapi/plugin-documentation": "4.0.0",
    "@strapi/plugin-i18n": "4.0.6",
    "@strapi/plugin-users-permissions": "4.0.0",
    "@strapi/strapi": "4.0.0"
    // ...
  }
}
```

:::

::: tab 4.0.6

```json
{
  // ...
  "dependencies": {
    "@strapi/plugin-documentation": "4.0.6",
    "@strapi/plugin-i18n": "4.0.6",
    "@strapi/plugin-users-permissions": "4.0.6",
    "@strapi/strapi": "4.0.6"
    // ...
  }
}
```

:::

::::-->
Save the edited `package.json` file and run either `yarn install` or `npm install` to install the new version.

::: tip
If the operation doesn't work, try removing your `yarn.lock` or `package-lock.json`. If that doesn't help, remove the `node_modules` folder as well and try again.
:::