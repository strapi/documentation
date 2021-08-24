---
title: Query Engine API - Strapi Developer Documentation
description: (add description here)
---
<!-- TODO: update SEO tags -->

# Query Engine API Reference

## Single operations

### `findOne(parameters) ⇒ Entry`

Finds the first entry matching the parameters.

#### Parameters

| Param    | Type                           | Description                                |
| -------- | ------------------------------ | ------------------------------------------ |
| select   | `string[]`                     | Select some attributes to return           |
| where    | [`WhereParam`](#filtering)     | Filter                                     |
| limit    | `number`                       | Always `1` when used with `findOne`        |
| offset   | `number`                       | How many entries to skip                   |
| orderBy  | [`OrderByParam`](#ordering)    | How to order the entries                   |
| populate | [`PopulateParam`](#populating) | Select which relations should be populated |

#### Example

```js
const entry = await db.query('article').findOne({
  select: ['title', 'description'],
  where: { title: 'Hello World' },
  orderBy: { title: 'DESC' },
  populate: { category: true },
});
```

### `findMany(parameters) ⇒ Entry[]`

Finds entries matching the parameters.

#### Parameters

| Param    | Type                           | Description                                |
| -------- | ------------------------------ | ------------------------------------------ |
| select   | `string[]`                     | Select some attributes to return           |
| where    | [`WhereParam`](#filtering)     | Filter                                     |
| limit    | `number`                       | How many entries to return                 |
| offset   | `number`                       | How many entries to skip                   |
| orderBy  | [`OrderByParam`](#ordering)    | How to order the entries                   |
| populate | [`PopulateParam`](#populating) | Select which relations should be populated |

#### Example

```js
const entries = await db.query('article').findMany({
  select: ['title', 'description'],
  where: { title: 'Hello World' },
  orderBy: { title: 'DESC' },
  populate: { category: true },
});
```

### `findWithCount(parameters) => [Entry[], number]`

Finds and counts entries matching the parameters.

#### Parameters

| Param    | Type                           | Description                                |
| -------- | ------------------------------ | ------------------------------------------ |
| select   | `string[]`                     | Select some attributes to return           |
| where    | [`WhereParam`](#filtering)     | Filter                                     |
| limit    | `number`                       | How many entries to return                 |
| offset   | `number`                       | How many entries to skip                   |
| orderBy  | [`OrderByParam`](#ordering)    | How to order the entries                   |
| populate | [`PopulateParam`](#populating) | Select which relations should be populated |

#### Example

```js
const [entries, count] = await db.query('article').findWithCount({
  select: ['title', 'description'],
  where: { title: 'Hello World' },
  orderBy: { title: 'DESC' },
  populate: { category: true },
});
```

### `create(parameters) => Entry`

Creates one entry and returns it.

#### Parameters

| Param    | Type                           | Description                                |
| -------- | ------------------------------ | ------------------------------------------ |
| select   | `string[]`                     | Select some attributes to return           |
| populate | [`PopulateParam`](#populating) | Select which relations should be populated |
| data     | `object`                       | Input data                                 |

#### Example

```js
const entry = await db.query('article').create({
  data: {
    title: 'My Article',
  },
});
```

### `update(parameters) => Entry`

Updates one entry and returns it.

#### Parameters

| Param    | Type                           | Description                                |
| -------- | ------------------------------ | ------------------------------------------ |
| select   | `string[]`                     | Select some attributes to return           |
| populate | [`PopulateParam`](#populating) | Select which relations should be populated |
| where    | [`WhereParam`](#filtering)     | Filter                                     |
| data     | `object`                       | Input data                                 |

#### Example

```js
const entry = await db.query('article').update({
  where: { id: 1 },
  data: {
    title: 'xxx',
  },
});
```

### `delete(parameters) => Entry`

Deletes one entry and returns it.

#### Parameters

| Param    | Type                           | Description                                |
| -------- | ------------------------------ | ------------------------------------------ |
| select   | `string[]`                     | Select some attributes to return           |
| populate | [`PopulateParam`](#populating) | Select which relations should be populated |
| where    | [`WhereParam`](#filtering)     | Filter                                     |

#### Example

```js
const entry = await db.query('article').delete({
  where: { id: 1 },
});
```

## Bulk operations

<!-- ? not sure we should include this caution, which was [part of the RFC](https://strapi-rfc-v4.netlify.app/database/query-engine.html#bulk-operation) -->
:::caution
To avoid performance pitfalls, bulk operations are not allowed on relations (attach/detach…).
:::

### `createMany(parameters) => { count: number }`

Creates multiple entries.

#### Parameters

| Param | Type       | Description         |
| ----- | ---------- | ------------------- |
| data  | `object[]` | Array of input data |

#### Example

```js
await db.query('article').createMany({
  data: [
    {
      title: 'ABCD',
    },
    {
      title: 'EFGH',
    },
  ],
});

// { count: 2 }
```

### `updateMany(parameters) => { count: number }`

Updates multiple entries matching the parameters.

#### Parameters

| Param | Type                       | Description         |
| ----- | -------------------------- | ------------------- |
| where | [`WhereParam`](#filtering) | Filter              |
| data  | `object`                   | Array of input data |

#### Example

```js
await db.query('article').updateMany({
  where: {
    price: 20,
  },
  data: {
    price: 18,
  },
});

// { count: 42 }
```

### `deleteMany(parameters) => { count: number }`

Deletes multiple entries matching the parameters.

#### Parameters

| Param | Type                       | Description |
| ----- | -------------------------- | ----------- |
| where | [`WhereParam`](#filtering) | Filter      |

#### Example

```js
await db.query('article').deleteMany({
  where: {
    title: {
      $startsWith: 'v3',
    },
  },
});

// { count: 42 }
```

## Aggregations

### `count(parameters) => number`

Counts entries matching the parameters.

#### Parameters

| Param | Type                       | Description |
| ----- | -------------------------- | ----------- |
| where | [`WhereParam`](#filtering) | Filter      |

```js
const count = await db.query('article').count({
  where: {
    title: {
      $startsWith: 'v3',
    },
  },
});

// 12
```

## Filtering

Every operator is prefixed with a `$` to make their name explicit.

### Logical operators

#### `$and`

Every nested conditions must be `true`.

**Example**

```js
const entries = await db.query('article').findMany({
  where: {
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
const entries = await db.query('article').findMany({
  where: {
    title: 'Hello World',
    rating: 12,
  },
});
```

#### `$or`

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

#### `$not`

Negates the nested conditions.

**Example**

```js
const entries = await db.query('article').findMany({
  where: {
    $not: {
      title: 'Hello World',
    },
  },
});
```

### Attribute Operators

#### `$not`

Negates nested condition. The `not` operator can be used in an attribute condition too.

**Example**

```js
const entries = await db.query('article').findMany({
  where: {
    title: {
      $not: {
        $contains: 'Hello World',
      },
    },
  },
});
```

#### `$eq`

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

#### `$ne`

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

#### `$in`

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

#### `$nin`

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

#### `$lt`

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

#### `$lte`

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

#### `$gt`

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

#### `$gte`

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

#### `$between`

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

#### `$contains`

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

#### `$startsWith`

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

#### `$endsWith`

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

#### `$null`

Attribute is `null`.

**Example**

```js
const entries = db.query('article').findMany({
  where: {
    title: {
      $null: true,
    },
  },
});
```

#### `$notNull`

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

## Populating

Relations and components have a unified API for populating them.

To populate all the root level relations, use `populate: true`:

```js
db.query('article').findMany({
  populate: true,
});
```

Select which data to populate by passing an array of attribute names:

```js
db.query('article').findMany({
  populate: ['componentA', 'relationA'],
});
```

An object can be passed for more advanced usage:

```js
db.query('article').findMany({
  populate: {
    componentB: true,
    dynamiczoneA: true,
    relation: someLogic || true,
  },
});
```

You can also apply where filters and select or populate nested relations:

```js
db.query('article').findMany({
  populate: {
    relationA: {
      where: {
        name: {
          $contains: 'Strapi',
        },
      },
    },

    repeatableComponent: {
      select: ['someAttributeName'],
      orderBy: ['someAttributeName'],
      populate: {
        componentRelationA: true,
      },
    },

    // NOTE: We can't do the same on dynamic zones as their polymorphic nature prevents it for now.
    // We will explore some concepts like graphQL fragments to allow this later on
    dynamiczoneA: true,
  },
});
```

## Ordering

### Single

```js
db.query('article').findMany({
  orderBy: 'id',
});

// single with direction
db.query('article').findMany({
  orderBy: { id: 'asc' },
});
```

### Multiple

```js
db.query('article').findMany({
  orderBy: ['id', 'name'],
});

// multiple with direction
db.query('article').findMany({
  orderBy: [{ id: 'asc' }, { name: 'desc' }],
});
```

### Relatonal ordering

```js
db.query('article').findMany({
  orderBy: {
    author: {
      name: 'asc',
    },
  },
});
```

## Pagination

```js
db.query('article').findMany({
  limit: 10,
  offset: 15,
});
```

---

## Custom Queries

> TODO: DOCUMENT

When in need fore more control over the queries than with the Query API you can use the underlying query builder.

> The API will specified at a later time

```js
db.query('article').findOne({});
db.entityManager.findOne('article', {});
```

```js
const qb = db.entityManager.createQueryBuilder('article');

const res = await qb.select('xxx').where({}).populate('xx').execute();
```

**Using QueryBuilder**

This allows doing more lower level queries while keeping some logic management like parsing / formating of values.

We can expose a Query Builder that will expose a fluent API that the repository uses. This woul keep the advantages of using the filter syntax but also smart populate.

```js
const qb = db.getQueryBuilder('article');

const articles = qb
  .select(['a', 'b'])
  .where({ $and: [] })
  .populate()
  .limit()
  .offset()
  .orderBy({ id: 'ASC' })
  .execute();
```

**Access the underlying connection isntance**

If you want know logic applied and plain db queries you can access the underlying connection like so

```js
const connection = db.getConnection();
```

TODO: uncomment and update this part based on video explanations

<!-- ## Components / DZ

### Populate

Components won't be populated by default in the DB layer. We will allow populating them like relations to have more features. This will allow more efficent DB queries for usecase that don't need the components.

We will however keep the auto populate in the business logic layer for the components so the Admin panel have the right data. We should think about it for the REST API (should it be optional or not).

This will also allow filtering on them & ordering them like a simple relation.

```js
db.query('article').findMany({
  populate: {
    componentB: true,
    dynamiczoneA: true,
  },
});

db.query('article').findMany({
  populate: {
    repeatableComponent: {
      select: [],
      limit: 2,
      offset: 10,
      orderBy: { field: 'asc' },
      populate: {},
    },
    // We can't do the same on dynamic zones as their polymorphic nature prevents it.
    dynamiczoneA: true,
  },
});
``` -->
