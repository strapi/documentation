---
title: Strapi plugins - Strapi Developer Docs
description: Strapi comes with built-in plugins (i18n, GraphQL, Users & Permissions, Upload, API documentation, and Email) and you can install plugins as npm packages.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/plugins/plugins-intro.html
---

# Strapi plugins

Strapi comes with these officially supported plugins:

<PluginsLinks>
</PluginsLinks>

## Automatic plugins discovery

Strapi automatically loads plugins installed with npm. Under the hood, Strapi scans every `package.json` file of the project dependencies, and looks for the following declaration:

```json
"strapi": {
  "kind": "plugin"
}
```

Installed plugins can also be manually enabled or disabled.

## Manual enabling/disabling

To disable a plugin without uninstalling it, switch its `enabled` key to `false` in the [`/config/plugins.js` file](/developer-docs/latest/setup-deployment-guides/configurations/optional/plugins.md).

::: strapi To go further
* To know more about plugins installation, see the [User guide](/user-docs/latest/plugins/introduction-to-plugins.md).
* Existing plugins can be [extended](/developer-docs/latest/development/plugins-extension.md), or you can even [create your own](/developer-docs/latest/development/plugins-development.md)!
:::
