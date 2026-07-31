---
title: Components and Dynamic Zones
description: Use Strapi's Entity Service to create and update components and dynamic zones.
displayed_sidebar: cmsSidebar
unlisted: true
---

import ESdeprecated from '/docs/snippets/entity-service-deprecated.md'

# Creating components and dynamic zones with the Entity Service API

<Tldr>

Use the Entity Service API to create and update components and dynamic zones while creating or updating entries. Components are single objects while dynamic zones are lists of components with a `__component` type identifier.

</Tldr>


<ESdeprecated />

The [Entity Service](/cms/api/entity-service) is the layer that handles [components](/cms/backend-customization/models#components-json) and [dynamic zones](/cms/backend-customization/models#dynamic-zones) logic. With the Entity Service API, components and dynamic zones can be [created](#creation) and [updated](#update) while creating or updating entries.

## Creation

A [component](/cms/backend-customization/models#components-json) can be created while creating an entry with the Entity Service API:

```js
strapi.entityService.create('api::article.article', {
  data: {
    myComponent: {
      foo: 'bar',
    },
  },
});
```

A [dynamic zone](/cms/backend-customization/models#dynamic-zones) (i.e. a list of components) can be created while creating an entry with the Entity Service API:

```js
strapi.entityService.create('api::article.article', {
  data: {
    myDynamicZone: [
      {
        __component: 'compo.type',
        foo: 'bar',
      },
      {
        __component: 'compo.type2',
        foo: 'bar',
      },
    ],
  },
});
```

## Update

A [component](/cms/backend-customization/models#components-json) can be updated while updating an entry with the Entity Service API. If a component `id` is specified, the component is updated, otherwise the old one is deleted and a new one is created:

```js
strapi.entityService.update('api::article.article', 1, {
  data: {
    myComponent: {
      id: 1, // will update component with id: 1 (if not specified, would have deleted it and created a new one)
      foo: 'bar',
    },
  },
});
```

A [dynamic zone](/cms/backend-customization/models#dynamic-zones) (i.e. a list of components) can be updated while updating an entry with the Entity Service API. If a component `id` is specified, the component is updated, otherwise the old one is deleted and a new one is created:

```js
strapi.entityService.update('api::article.article', 1, {
  data: {
    myDynamicZone: [
      {
        // will update
        id: 2,
        __component: 'compo.type',
        foo: 'bar',
      },
      {
        // will add a new & delete old ones
        __component: 'compo.type2',
        foo: 'bar2',
      },
    ],
  },
});
```

## Component screenshots in the Dynamic Zone picker

<!-- unverified: placement on this page — this feature relates to component schema configuration and Content Manager UI (strapi/strapi#26863). Consider moving to cms/backend-customization/models.md or a Content Manager page. -->

You can add an optional `screenshot` field to a component's `info` object in its `schema.json` file. When set, the Dynamic Zone component picker in the Content Manager displays a thumbnail preview for that component instead of the default icon.

<!-- source: PR #26863 (https://github.com/strapi/strapi/pull/26863) — SchemaInfo type in @strapi/types -->

The `screenshot` field accepts:
- A root-relative path served by Strapi's built-in static middleware (for example, `/_component-screenshots/hero.png`), with the image placed in the project's `public/` directory.
- An absolute URL pointing to a CDN or external image host.

### Adding a screenshot to a component

1. Open the component's `schema.json` file and add a `screenshot` field to the `info` object:

<!-- source: PR #26863 (https://github.com/strapi/strapi/pull/26863) — example from PR description -->

   ```json
   {
     "info": {
       "displayName": "Hero Section",
       "icon": "layout",
       "screenshot": "/_component-screenshots/hero-section.png"
     }
   }
   ```

2. If using a root-relative path, place the image file in the project's `public` directory at the specified path (for example, `public/_component-screenshots/hero-section.png`).
3. Start or restart Strapi.
4. Open a content type that contains a Dynamic Zone in the Content Manager, then click **Add a component** and expand a component category.

The picker displays the screenshot as a thumbnail for that component. Hovering over the thumbnail shows an enlarged preview. Components without a `screenshot` continue to display the default icon.
