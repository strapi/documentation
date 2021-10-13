---
title: Filtering with Entity Service API - Strapi Developer Documentation
description: …
---

<!-- TODO: update SEO -->

# Entity Service API: Components and Dynamic zones

The entity service is the layer that handles components logic.

**Create Compo while creating entry**

```js
strapi.entityService.create('articles', {
  data: {
    myCompo: {
      foo: 'bar',
    },
  },
});
```

**Update Compo while updating entry**

```js
strapi.entityService.update('articles', 1, {
  data: {
    myCompo: {
      id: 1, // when specifying the component id it will update it. otherwise it will delete the old one and create a new one
      foo: 'bar',
    },
  },
});
```

**Create DZ Compo while creating entry**

```js
strapi.entityService.create('articles', {
  data: {
    myDZ: [
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

**Update DZ Compo while updating entry**

```js
strapi.entityService.update('articles', 1, {
  data: {
    myDZ: [
      {
        // will update
        id: 2,
        __component: 'compo.type',
        foo: 'bar',
      },
      {
        // will add new & remove old ones
        __component: 'compo.type2',
        foo: 'bar2',
      },
    ],
  },
});
```

### Populate

```js
strapi.entityService.findMany('articles', {
  populate: {
    componentB: true,
    dynamiczoneA: true,
  },
});

strapi.entityService.findMany('articles', {
  populate: {
    repeatableComponent: {
      fields: [],
      filters: {},
      sort: 'field:asc',
      populate: {},
    },
  },
});
```
