---
unlisted: true
title: Filtering with the Query Engine API
description: Use Strapi's Query Engine API to filter the results of your queries.
displayed_sidebar: devDocsSidebar
tags:
- API
- Content API
- filters
- logical operators
- Query Engine API
---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'
import ConsiderDocumentService from '/docs/snippets/consider-document-service.md'

# Filtering with the Query Engine API

<ConsiderDocumentService />

The [Query Engine API](/dev-docs/api/query-engine/) offers the ability to filter results found with its [findMany()](/dev-docs/api/query-engine/single-operations#findmany) method.

Results are filtered with the `where` parameter that accepts [logical operators](#logical-operators) and [attribute operators](#attribute-operators). Every operator should be prefixed with `$`.

## Logical operators

### `$and`

All nested conditions must be `true`.

**Example**

```js
const entries = await strapi.db.query('api::article.article').findMany({
  where: {
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

`$and` is used implicitly when passing an object with nested conditions:

```js
const entries = await strapi.db.query('api::article.article').findMany({
  where: {
    title: 'Hello World',
    createdAt: { $gt: '2021-11-17T14:28:25.843Z' },
  },
});
```

### `$or`

One or many nested conditions must be `true`.

**Example**

```js
const entries = await strapi.db.query('api::article.article').findMany({
  where: {
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
const entries = await strapi.db.query('api::article.article').findMany({
  where: {
    $not: {
      title: 'Hello World',
    },
  },
});
```

:::note
`$not` can be used:

- as a logical operator (e.g. in `where: { $not: { // conditions… }}`)
- or [as an attribute operator](#not-2) (e.g. in `where: { attribute-name: $not: { … } }`).
:::

:::tip
`$and`, `$or` and `$not` operators are nestable inside of another `$and`, `$or` or `$not` operator.
:::

## Attribute Operators

:::caution
Using these operators may give different results depending on the database's implementation, as the comparison is handled by the database and not by Strapi.
:::

### `$not`

Negates nested condition(s).

**Example**

```js
const entries = await strapi.db.query('api::article.article').findMany({
  where: {
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
const entries = await strapi.db.query('api::article.article').findMany({
  where: {
    title: {
      $eq: 'Hello World',
    },
  },
});
```

`$eq` can be omitted:

```js
const entries = await strapi.db.query('api::article.article').findMany({
  where: {
    title: 'Hello World',
  },
});
```

### `$eqi`

Attribute equals input value (case-insensitive).

**Example**

```js
const entries = await strapi.db.query('api::article.article').findMany({
  where: {
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
const entries = await strapi.db.query('api::article.article').findMany({
  where: {
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
const entries = await strapi.db.query('api::article.article').findMany({
  where: {
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
const entries = await strapi.db.query('api::article.article').findMany({
  where: {
    title: {
      $in: ['Hello', 'Hola', 'Bonjour'],
    },
  },
});
```

`$in` can be omitted when passing an array of values:

```js
const entries = await strapi.db.query('api::article.article').findMany({
  where: {
    title: ['Hello', 'Hola', 'Bonjour'],
  },
});
```

### `$notIn`

Attribute is not contained in the input list.

**Example**

```js
const entries = await strapi.db.query('api::article.article').findMany({
  where: {
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
const entries = await strapi.db.query('api::article.article').findMany({
  where: {
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
const entries = await strapi.db.query('api::article.article').findMany({
  where: {
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
const entries = await strapi.db.query('api::article.article').findMany({
  where: {
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
const entries = await strapi.db.query('api::article.article').findMany({
  where: {
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
const entries = await strapi.db.query('api::article.article').findMany({
  where: {
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
const entries = await strapi.db.query('api::article.article').findMany({
  where: {
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
const entries = await strapi.db.query('api::article.article').findMany({
  where: {
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
const entries = await strapi.db.query('api::article.article').findMany({
  where: {
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
const entries = await strapi.db.query('api::article.article').findMany({
  where: {
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
const entries = await strapi.db.query('api::article.article').findMany({
  where: {
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
const entries = await strapi.db.query('api::article.article').findMany({
  where: {
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
const entries = await strapi.db.query('api::article.article').findMany({
  where: {
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
const entries = await strapi.db.query('api::article.article').findMany({
  where: {
    title: {
      $notNull: true,
    },
  },
});
```
