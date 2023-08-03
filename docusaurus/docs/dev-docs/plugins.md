---
title: Strapi plugins - Strapi Developer Docs
description: Strapi comes with built-in plugins (i18n, GraphQL, Users & Permissions, Upload, API documentation, and Email) and you can install plugins as npm packages.
displayed_sidebar: devDocsSidebar

---

# Strapi plugins

_The content of this page will soon be moved to "Using plugins" and replaced by a more general plugins introduction._

***

Strapi comes with these officially supported plugins:

<DocCardList />

## Automatic plugins discovery

Strapi automatically loads plugins installed with npm. Under the hood, Strapi scans every `package.json` file of the project dependencies, and looks for the following declaration:

```json
"strapi": {
  "kind": "plugin"
}
```

Installed plugins can also be manually enabled or disabled.

## Manual enabling/disabling

To disable a plugin without uninstalling it, switch its `enabled` key to `false` in the [`/config/plugins.js` file](/dev-docs/configurations/plugins).

:::strapi To go further
* To know more about plugins installation, see the [User guide](/user-docs/plugins).
* Existing plugins can be [extended](/dev-docs/plugins-extension), or you can even [create your own](/dev-docs/plugins-development)!
:::
