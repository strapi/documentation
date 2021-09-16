---
title: Filtering Operations for Query Engine API - Strapi Developer Documentation
description: (add description here)
sidebarDepth: 3
---
<!-- TODO: update SEO tags -->
# Query Engine API: Filtering

Every operator is prefixed with a `$` to make their name explicit.

## Logical operators

### `$and`

Every nested conditions must be `true`.

**Example**

```js
const entries = await db.query('article').findMany({
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

`$and` will be used implicitly when passing an object with nested conditions:

```js
const entries = await db.query('article').findMany({
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
const entries = await db.query('article').findMany({
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
const entries = await db.query('article').findMany({
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
const entries = await db.query('article').findMany({
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
const entries = await db.query('article').findMany({
  where: {
    title: {
      $eq: 'Hello World',
    },
  },
});
```

`$eq` can be omitted

```js
const entries = await db.query('article').findMany({
  where: {
    title: 'Hello World',
  },
});
```

### `$ne`

Attribute does not equal input value.

**Example**

```js
const entries = db.query('article').findMany({
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
const entries = db.query('article').findMany({
  where: {
    title: {
      $in: ['Hello', 'Hola', 'Bonjour'],
    },
  },
});
```

`$in` can be ommited when passing an array of values

```js
const entries = db.query('article').findMany({
  where: {
    title: ['Hello', 'Hola', 'Bonjour'],
  },
});
```

### `$nin`

Attribute is not contained in the input list.

**Example**

```js
const entries = db.query('article').findMany({
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
const entries = db.query('article').findMany({
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
const entries = db.query('article').findMany({
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
const entries = db.query('article').findMany({
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
const entries = db.query('article').findMany({
  where: {
    rating: {
      $gte: 5,
    },
  },
});
```

### `$between`

Attribute is between the two input values.

**Example**

```js
const entries = db.query('article').findMany({
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
const entries = db.query('article').findMany({
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
const entries = db.query('article').findMany({
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
const entries = db.query('article').findMany({
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
const entries = db.query('article').findMany({
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
const entries = db.query('article').findMany({
  where: {
    title: {
      $notNull: true,
    },
  },
});
```
