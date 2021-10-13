---
title: Filtering with Entity Service API - Strapi Developer Documentation
description: …
sidebarDepth: 3
---

<!-- TODO: update SEO -->

# Entity Service API: Filtering

Every operator should be prefixed with `$`.

## Logical operators

### `$and`

All nested conditions must be `true`.

**Example**

```js
const entries = await strapi.entityService.findMany('articles', {
  filters {
    $and: [
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

`$and` will be used implicitly when passing an object with nested conditions.

```js
const entries = await strapi.entityService.findMany('articles', {
  filters {
    title: 'Hello World',
    rating: 12,
  },
});
```

### `$or`

One or many nested conditions must be `true`

**Example**

```js
const entries = await strapi.entityService.findMany('articles', {
  filters {
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
const entries = await strapi.entityService.findMany('articles', {
  filters {
    $not: {
      title: 'Hello World',
    },
  },
});
```

## Attribute Operators

**List**:

- `$in`
- `$notIn`
- `$eq`
- `$ne`
- `$gt`
- `$gte`
- `$lt`
- `$lte`
- `$null`
- `$notNull`
- `$between`
- `$startsWith`
- `$endsWith`
- `$contains`
- `$notContains`
- `$containsi` : insensitive
- `$notContainsi` insensitive

### `$not`

Negates nested condition. The `not` operator can be use in an attribute condition too.

**Example**

```js
const entries = await strapi.entityService.findMany('articles', {
  filters {
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
const entries = await strapi.entityService.findMany('articles', {
  filters {
    title: {
      $eq: 'Hello World',
    },
  },
});
```

`$eq` can be omitted

```js
const entries = await strapi.entityService.findMany('articles', {
  filters {
    title: 'Hello World',
  },
});
```

### `$ne`

Attribute does not equal input value.

**Example**

```js
const entries = strapi.entityService.findMany('articles', {
  filters {
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
const entries = strapi.entityService.findMany('articles', {
  filters {
    title: {
      $in: ['Hello', 'Hola', 'Bonjour'],
    },
  },
});
```

`$in` can be ommited when passing an array of values

```js
const entries = strapi.entityService.findMany('articles', {
  filters {
    title: ['Hello', 'Hola', 'Bonjour'],
  },
});
```

### `$nin`

Attribute is not contained in the input list.

**Example**

```js
const entries = strapi.entityService.findMany('articles', {
  filters {
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
const entries = strapi.entityService.findMany('articles', {
  filters {
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
const entries = strapi.entityService.findMany('articles', {
  filters {
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
const entries = strapi.entityService.findMany('articles', {
  filters {
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
const entries = strapi.entityService.findMany('articles', {
  filters {
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
const entries = strapi.entityService.findMany('articles', {
  filters {
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
const entries = strapi.entityService.findMany('articles', {
  filters {
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
const entries = strapi.entityService.findMany('articles', {
  filters {
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
const entries = strapi.entityService.findMany('articles', {
  filters {
    title: {
      $endsWith: 'ABCD',
    },
  },
});
```

### `$null`

Attribute is null`.

**Example**

```js
const entries = strapi.entityService.findMany('articles', {
  filters {
    title: {
      $null: true,
    },
  },
});
```

### `$notNull`

Attribute is not null.

**Example**

```js
const entries = strapi.entityService.findMany('articles', {
  filters {
    title: {
      $notNull: true,
    },
  },
});
```
