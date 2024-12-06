---
title: injectContentManagerComponent() removed
description: In Strapi 5, the Content Manager is a plugin, which affects the injectContentManagerComponent() method, replaced by getPlugin('content-manager').injectComponent().
sidebar_label: injectContentManagerComponent() removed
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - content manager
 - admin panel API
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'
import NoCodemods from '/docs/snippets/breaking-change-not-handled-by-codemod.md'

# `injectContentManagerComponent()` removed

In Strapi 5, the `injectContentManagerComponent` method is removed because the Content Manager is now a plugin. The [Admin Panel API](/dev-docs/plugins/admin-panel-api#injecting-components) method is replaced by `getPlugin('content-manager').injectComponent()`.

<Intro />

<YesPlugins />
<NoCodemods />

## Breaking change description

**In Strapi v4**

A component is injected into the Content Manager as follows:

```tsx
app.injectContentManagerComponent('editView', 'right-links', {
    name: 'PreviewButton',
    Component: () => (
      <Button onClick={() => window.alert('Not here, The preview is.')}>Preview</Button>
    ),
  });
```

**In Strapi 5**

A component is injected into the Content Manager as follows:

```tsx
app.getPlugin('content-manager').injectComponent('editView', 'right-links', {
    name: 'PreviewButton',
    Component: () => (
      <Button onClick={() => window.alert('Not here, The preview is.')}>Preview</Button>
    ),
  });
```

### Migration steps

Change your plugin `index.ts` file from:

  ```js
  app.injectContentManagerComponent()
  ```

to the following:

  ```tsx
  app.getPlugin('content-manager').injectComponent()
  ```
