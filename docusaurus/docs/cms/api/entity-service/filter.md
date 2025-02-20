---
title: Filtering with the Entity Service API
description: Use Strapi's Entity Service API to filter your queries results.
displayed_sidebar: cmsSidebar
unlisted: true
---

import ESdeprecated from '/docs/snippets/entity-service-deprecated.md'
import DeepFilteringBlogLink from '/docs/snippets/deep-filtering-blog.md'

# Filtering with the Entity Service API

<ESdeprecated />

The [Entity Service API](/cms/api/entity-service) offers the ability to filter results found with its [findMany()](/cms/api/entity-service/crud#findmany) method.

Results are filtered with the `filters` parameter that accepts [logical operators](#logical-operators) and [attribute operators](#attribute-operators). Every operator should be prefixed with `$`.

<DeepFilteringBlogLink/>

## Logical operators

### `$and`

All nested conditions must be `true`.

**Example**

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  filters: {
    $and: [
      {
        title: 'Hello World',
      },
      {
        createdAt: { $gt: '2021-11-17T14:28:25.843Z' },
      },
    ],
  },
});
```

`$and` will be used implicitly when passing an object with nested conditions:

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  filters: {
    title: 'Hello World',
    createdAt: { $gt: '2021-11-17T14:28:25.843Z' },
  },
});
```

### `$or`

One or many nested conditions must be `true`.

**Example**

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  filters: {
    $or: [
      {
        title: 'Hello World',
      },
      {
        createdAt: { $gt: '2021-11-17T14:28:25.843Z' },
      },
    ],
  },
});
```

### `$not`

Negates the nested conditions.

**Example**

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  filters: {
    $not: {
      title: 'Hello World',
    },
  },
});
```

:::note
`$not` can be used as:

- a logical operator (e.g. in `filters: { $not: { // conditions… }}`)
- [an attribute operator](#not-1) (e.g. in `filters: { attribute-name: $not: { … } }`).
:::

:::tip
`$and`, `$or` and `$not` operators are nestable inside of another `$and`, `$or` or `$not` operator.
:::

## Attribute Operators

:::caution
Using these operators may give different results depending on the database's implementation, as the comparison is handled by the database and not by Strapi.
:::

### `$not`

Negates the nested condition(s).

**Example**

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  filters: {
    title: {
      $not: {
        $contains: 'Hello World',
      },
    },
  },
});
```

### `$eq`

Attribute equals input value.

**Example**

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  filters: {
    title: {
      $eq: 'Hello World',
    },
  },
});
```

`$eq` can be omitted:

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  filters: {
    title: 'Hello World',
  },
});
```

### `$eqi`

Attribute equals input value (case-insensitive).

**Example**

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  filters: {
    title: {
      $eqi: 'HELLO World',
    },
  },
});
```

### `$ne`

Attribute does not equal input value.

**Example**

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  filters: {
    title: {
      $ne: 'ABCD',
    },
  },
});
```

### `$nei`

Attribute does not equal input value (case-insensitive).

**Example**

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  filters: {
    title: {
      $nei: 'abcd',
    },
  },
});
```

### `$in`

Attribute is contained in the input list.

**Example**

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  filters: {
    title: {
      $in: ['Hello', 'Hola', 'Bonjour'],
    },
  },
});
```

`$in` can be omitted when passing an array of values:

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  filters: {
    title: ['Hello', 'Hola', 'Bonjour'],
  },
});
```

### `$notIn`

Attribute is not contained in the input list.

**Example**

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  filters: {
    title: {
      $notIn: ['Hello', 'Hola', 'Bonjour'],
    },
  },
});
```

### `$lt`

Attribute is less than the input value.

**Example**

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  filters: {
    rating: {
      $lt: 10,
    },
  },
});
```

### `$lte`

Attribute is less than or equal to the input value.

**Example**

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  filters: {
    rating: {
      $lte: 10,
    },
  },
});
```

### `$gt`

Attribute is greater than the input value.

**Example**

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  filters: {
    rating: {
      $gt: 5,
    },
  },
});
```

### `$gte`

Attribute is greater than or equal to the input value.

**Example**

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  filters: {
    rating: {
      $gte: 5,
    },
  },
});
```

### `$between`

Attribute is between the 2 input values, boundaries included (e.g., `$between[1, 3]` will also return `1` and `3`).

**Example**

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  filters: {
    rating: {
      $between: [1, 20],
    },
  },
});
```

### `$contains`

Attribute contains the input value (case-sensitive).

**Example**

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  filters: {
    title: {
      $contains: 'Hello',
    },
  },
});
```

### `$notContains`

Attribute does not contain the input value (case-sensitive).

**Example**

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  filters: {
    title: {
      $notContains: 'Hello',
    },
  },
});
```

### `$containsi`

Attribute contains the input value. `$containsi` is not case-sensitive, while [$contains](#contains) is.

**Example**

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  filters: {
    title: {
      $containsi: 'hello',
    },
  },
});
```

### `$notContainsi`

Attribute does not contain the input value. `$notContainsi` is not case-sensitive, while [$notContains](#notcontains) is.

**Example**

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  filters: {
    title: {
      $notContainsi: 'hello',
    },
  },
});
```

### `$startsWith`

Attribute starts with input value.

**Example**

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  filters: {
    title: {
      $startsWith: 'ABCD',
    },
  },
});
```

### `$endsWith`

Attribute ends with input value.

**Example**

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  filters: {
    title: {
      $endsWith: 'ABCD',
    },
  },
});
```

### `$null`

Attribute is `null`.

**Example**

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  filters: {
    title: {
      $null: true,
    },
  },
});
```

### `$notNull`

Attribute is not `null`.

**Example**

```js
const entries = await strapi.entityService.findMany('api::article.article', {
  filters: {
    title: {
      $notNull: true,
    },
  },
});
```
