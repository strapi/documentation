---
title: Building complex queries with the qs library - Strapi Developer Documentation
description: 
---
<!-- TODO: update SEO -->

# Building complex queries with `qs`
<!-- TODO: review this whole part with a dev -->

<!-- TODO: add intro here -->

## General usage

:::note
`OR` and `AND` operations are available starting from v3.1.0
:::

When building more complex queries you must use the `_where` query parameter in combination with the [`qs`](https://github.com/ljharb/qs) library.

We are taking advantage of the capability of `qs` to parse nested objects to create more complex queries.

This will give you full power to create complex queries with logical `AND` and `OR` operations.

:::caution
We strongly recommend using `qs` directly to generate complex queries instead of creating them manually.
:::

### `AND` operator

The filtering implicitly supports the `AND` operation when specifying an array of expressions in the filtering.

**Examples**

Restaurants that have 1 `stars` and a `pricing` less than or equal to 20:

```js
const query = qs.stringify({
  _where: [{ stars: 1 }, { pricing_lte: 20 }],
});

await request(`/restaurants?${query}`);
// GET /restaurants?_where[0][stars]=1&_where[1][pricing_lte]=20
```

Restaurants that have a `pricing` greater than or equal to 20 and a `pricing` less than or equal to 50:

```js
const query = qs.stringify({
  _where: [{ pricing_gte: 20 }, { pricing_lte: 50 }],
});

await request(`/restaurants?${query}`);
// GET /restaurants?_where[0][pricing_gte]=20&_where[1][pricing_lte]=50
```

### `OR` operator

To use the `OR` operation, you will need to use the `_or` filter and specify an array of expressions on which to perform the operation.

**Examples**

Restaurants that have 1 `stars` OR a `pricing` greater than 30:

```js
const query = qs.stringify({ _where: { _or: [{ stars: 1 }, { pricing_gt: 30 }] } });

await request(`/restaurant?${query}`);
// GET /restaurants?_where[_or][0][stars]=1&_where[_or][1][pricing_gt]=30
```

Restaurants that have a `pricing` less than 10 OR greater than 30:

```js
const query = qs.stringify({ _where: { _or: [{ pricing_lt: 10 }, { pricing_gt: 30 }] } });

await request(`/restaurant?${query}`);
// GET /restaurants?_where[_or][0][pricing_lt]=10&_where[_or][1][pricing_gt]=30
```

### Implicit `OR` operator

The query engine implicitly uses the `OR` operation when you pass an array of values in an expression.

#### Examples

Restaurants that have 1 or 2 `stars`:

:::request Example request: Restaurants that have 1 or 2 `stars`
`GET /restaurants?stars=1&stars=2`
:::

or

```js
const query = qs.stringify({ _where: { stars: [1, 2] } });

await request(`/restaurant?${query}`);
// GET /restaurants?_where[stars][0]=1&_where[stars][1]=2
```

:::note
When using the `in` and `nin` filters the array is not transformed into a OR.
:::

### Combining AND and OR operators

Restaurants that have (2 `stars` AND a `pricing` less than 80) OR (1 `stars` AND a `pricing` greater than or equal to 50)

```js
const query = qs.stringify({
  _where: {
    _or: [
      [{ stars: 2 }, { pricing_lt: 80 }], // implicit AND
      [{ stars: 1 }, { pricing_gte: 50 }], // implicit AND
    ],
  },
});

await request(`/restaurants?${query}`);
// GET /restaurants?_where[_or][0][0][stars]=2&_where[_or][0][1][pricing_lt]=80&_where[_or][1][0][stars]=1&_where[_or][1][1][pricing_gte]=50
```

**This also works with deep filtering**

Restaurants that have (2 `stars` AND a `pricing` less than 80) OR (1 `stars` AND serves French food)

```js
const query = qs.stringify({
  _where: {
    _or: [
      [{ stars: 2 }, { pricing_lt: 80 }], // implicit AND
      [{ stars: 1 }, { 'categories.name': 'French' }], // implicit AND
    ],
  },
});

await request(`/restaurants?${query}`);
// GET /restaurants?_where[_or][0][0][stars]=2&_where[_or][0][1][pricing_lt]=80&_where[_or][1][0][stars]=1&_where[_or][1][1][categories.name]=French
```

:::caution
When creating nested queries, make sure the depth is less than 20 or the query string parsing will fail.
:::

## Programmatic usage of API parameters

### Sorting

The [`qs`](https://github.com/ljharb/qs) library can also be used to sort:

```js
qs.stringify({
  sort: 'title,price',
});

// or
qs.stringify({
  sort: ['title', 'price'],
});
```

### Selecting fields

The [`qs`](https://github.com/ljharb/qs) library can also be used to select fields:

<!-- ? can we use wildcards (is it implemented yet?) -->
```js
qs.stringify({
  fields: ['title', 'author.name', 'author.lastname', 'created_at'],
});

// or
qs.stringify({
  fields: ['title', 'author.*', 'created_at'],
});
```

### Populating relations

The [`qs`](https://github.com/ljharb/qs) library can also be used to populate relations:

```js
qs.stringify({
  populate: ['friends', 'comments.author'],
});

// or
qs.stringify({
  populate: 'friends,comments.author',
});
```
