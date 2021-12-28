---
title: Filtering Operations for Query Engine API - Strapi Developer Docs
description: Use Strapi's Query Engine API to filter the results of your queries.
sidebarDepth: 3
canonicalUrl: https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/query-engine/filtering.html
---

# Query Engine API: Filtering

The [Query Engine API](/developer-docs/latest/developer-resources/database-apis-reference/query-engine-api.md) offers the ability to filter results found with its [findMany()](/developer-docs/latest/developer-resources/database-apis-reference/query-engine/single-operations.md#findmany) method.

Results are filtered with the `filters` parameter that accepts [logical operators](#logical-operators) and [attribute operators](#attribute-operators). Every operator should be prefixed with `$`.

## Logical operators

### `$and`

All nested conditions must be `true`.

**Example**

```js
const entries = await strapi.db.query('api::article.article').findMany({
  where: {
    $and: [
      {
        rating: {
          $gte: 12,
        }
      },
      {
        title: {
          $contains: 'Hello',
        },
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
    rating: 12,
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
        title: {
          $contains: 'Hello',
        },
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
      title: {
        $contains: 'Hello'
      },
    },
  },
});
```

## Attribute Operators

:::caution
Using these operators may give different results depending on the database's implementation, as the comparison is handled by the database and not by Strapi.
:::

### `$not`

Negates nested condition. The `not` operator can be used in an attribute condition too.

**Example**
```js
const entries = await strapi.db.query('api::article.article').findMany({
  where: {
    title: {
      $not: 'Hello World',
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

### `$ne`

Attribute does not equal input value.

**Example**

```js
const entries = strapi.db.query('api::article.article').findMany({
  where: {
    title: {
      $ne: 'ABCD',
    },
  },
});
```

### `$in`

Attribute is contained in the input list.

**Example**

```js
const entries = strapi.db.query('api::article.article').findMany({
  where: {
    title: {
      $in: ['Hello', 'Hola', 'Bonjour'],
    },
  },
});
```

`$in` can be omitted when passing an array of values

```js
const entries = strapi.db.query('api::article.article').findMany({
  where: {
    title: ['Hello', 'Hola', 'Bonjour'],
  },
});
```

### `$nin`

Attribute is not contained in the input list.

**Example**

```js
const entries = strapi.db.query('api::article.article').findMany({
  where: {
    title: {
      $nin: ['Hello', 'Hola', 'Bonjour'],
    },
  },
});
```

### `$lt`

Attribute is less than the input value.

**Example**

```js
const entries = strapi.db.query('api::article.article').findMany({
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
const entries = strapi.db.query('api::article.article').findMany({
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
const entries = strapi.db.query('api::article.article').findMany({
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
const entries = strapi.db.query('api::article.article').findMany({
  where: {
    rating: {
      $gte: 5,
    },
  },
});
```

### `$between`

Attribute is between the 2 input values.

**Example**

```js
const entries = strapi.db.query('api::article.article').findMany({
  where: {
    rating: {
      $between: [1, 20],
    },
  },
});
```


### `$contains`

Attribute contains the input value.

**Example**

```js
const entries = strapi.db.query('api::article.article').findMany({
  where: {
    title: {
      $contains: 'ABCD',
    },
  },
});
```

### `$startsWith`

Attribute starts with input value.

**Example**

```js
const entries = strapi.db.query('api::article.article').findMany({
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
const entries = strapi.db.query('api::article.article').findMany({
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
const entries = strapi.db.query('api::article.article').findMany({
  where: {
    title: {
      $null: false,
    },
  },
});
```

### `$notNull`

Attribute is not `null`.

**Example**

```js
const entries = strapi.db.query('api::article.article').findMany({
  where: {
    title: {
      $notNull: true,
    },
  },
});
```
