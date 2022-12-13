---
title: Reordering relations
description: Use the REST API to manage the order of relations
canonicalUrl: https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/relations-reordering.html
---

<style lang="scss" scoped>
@media (min-width: 1536px) {
  .custom-block.api-call > .response {
    flex: 0 0 32%;
  }
}
</style>

# Managing relations through the REST API <BetaBadge />

Relations between content-types can be managed through the [admin panel](/user-docs/latest/content-manager/managing-relational-fields.md#managing-multiple-choices-relational-fields) or through [REST](/developer-docs/latest/developer-resources/database-apis-reference/rest-api.md) requests sent to the Content API.

Relations can be added, updated, or removed through the Content API by passing parameters in the body of the request:

|  Parameter name | Description | Type of update |
|-----------------|------------------|----------------|
| [`connect`](#connect)       | Adds relation(s).<br /><br />Can be used in combination with `disconnect`.<br /><br />Can be used with [positional arguments](#relations-reordering) to define an order for relations.    | Partial
| [`disconnect`](#disconnect)    | Removes relation(s).<br /><br />Can be used in combination with `connect`. | Partial
| [`set`](#set)           | Sets relations, replacing all the existing ones.<br /><br />Must be used alone.  | Full

Using `connect` allows adding [positional arguments](#relations-reordering) to define an order for relations.

<br/>

## `connect`

Using `connect` in the body of a request performs a partial update, adding specified relations.

`connect` accepts either a shorthand or a longhand syntax.

| Syntax type | Syntax example |
| ------------|----------------|
| shorthand   | `connect: [2, 4]`
| longhand    | ```connect: [ {id: 2}, {id: 4} ]``` |

You can also use the longhand syntax to [reorder relations](#relations-reordering).

`connect` can be used in combination with [`disconnect`](#disconnect).

<br />


:::::: tabs card

::::: tab Shorthand syntax example

::: request Example request using the shorthand syntax

`PUT http://localhost:1337/api/restaurants/1`

```json
{
  data: {
    categories: { 
      connect: [2, 4],
    }
  }
}
```

:::

:::::

::::: tab Longhand syntax example

::: request Example request using the longhand syntax

`PUT http://localhost:1337/api/restaurants/1`

```json
{
  data: {
    categories: { 
      connect: [
        { id: 2 },
        { id: 4 }
      ], 
    }
  }
}
```

:::

:::::
::::::


### Relations reordering

Positional arguments can be passed to the longhand syntax of `connect` to define the order of relations.

The longhand syntax accepts an array of objects, each object containing the `id` of the relation to be connected and an optional `position` object to define where to connect the relation.

::: note Different syntaxes for different relations
The syntaxes described in this documentation are useful for one-to-many, many-to-many and many-ways relations.<br />For one-to-one, many-to-one and one-way relations, the syntaxes are also supported but only the last relation will be used, so it's preferable to use a shorter format (e.g.: `{ data: { category: 2 } }`, see [REST API documentation](/developer-docs/latest/developer-resources/database-apis-reference/rest-api.md#requests)).
:::

To define the `position` for a relation, pass one of the following 4 different positional attributes:

| Parameter name and syntax | Description                                                            | Type       |
| ------------------------- | ---------------------------------------------------------------------- | ---------- |
| `before: id`              | Positions the relation before the given `id`.                          | Entry `id` |
| `after: id`               | Positions the relation after the given `id`.                           | Entry `id` |
| `start: true`             | Positions the relation at the start of the existing list of relations. | Boolean    |
| `end: true`               | Positions the relation at the end of the existing list of relations.   | Boolean    |

The `position` argument is optional and defaults to `position: { end: true }`.

:::note Sequential order
Since `connect` is an array, the order of operations is important as they will be treated sequentially (see combined example below).
:::

::::: tabs card

:::: tab Basic example

Consider the following record in the database:

```json
categories: [
  { id: 1, order: 1 }
  { id: 2, order: 2 }
]
```

Sending the following request updates a `restaurant` entry and creates a third relation of `id` `3` for the `categories` attribute and position it before the relation with `id` `2`:

::: request Example request to update the position of one relation

`PUT http://localhost:1337/api/restaurants/1`

```json
{
  data: {
    categories: {
      connect: [
        { id: 3, position: { before: 2 } },
      ]
    }
  }
}
```

:::
::::

:::: tab Combined example

Consider the following record in the database:

```json
categories: [
  { id: 1, order: 1 }
  { id: 2, order: 2 }
]
```

Sending the following example in the request body of a PUT request updates multiple relations:

::: request Example request to reorder several relations

`PUT http://localhost:1337/api/restaurants/1`

```json
{
  data: {
    categories: {
      connect: [
        { id: 6, position: { after: 1} },
        { id: 7, position: { before: 2 } },
        { id: 8, position: { end: true } },
        { id: 9 },
        { id: 10, position: { start: true } },
      ]
    }
  }
}
```

:::

Omitting the `position` argument defaults (as in `id: 9` defaults to `position: { end: true }`. All other relations are positioned relative to another existing `id` (using `after` or `before`) or relative to the list of relations (using `start` or `end`). Operations are treated sequentially, in the order defined in the `connect` array, so the resulting database record will be the following:

```json
categories: [
  { id: 10, order: 1 },
  { id: 1, order: 2 },
  { id: 6, order: 3 },
  { id: 7, order: 4 },
  { id: 2, order: 5 },
  { id: 8, order: 6 },
  { id: 9, order: 7 }
]
```

::::

:::::

## `disconnect`

Using `disconnect` in the body of a request performs a partial update, removing specified relations.

`disconnect` accepts either a shorthand or a longhand syntax.

| Syntax type | Syntax example |
| ------------|----------------|
| shorthand   | `disconnect: [2, 4]`
| longhand    | ```disconnect: [ {id: 2}, {id: 4} ]``` |

`disconnect` can be used in combination with [`connect`](#connect).

<br />

:::::: tabs card

::::: tab Shorthand syntax example

::: request Example request using the shorthand syntax

`PUT http://localhost:1337/api/restaurants/1`

```json
{
  data: {
    categories: { 
      disconnect: [2, 4],
    }
  }
}
```

:::

:::::

::::: tab Longhand syntax example

::: request Example request using the longhand syntax

`PUT http://localhost:1337/api/restaurants/1`

```json
{
  data: {
    categories: { 
      disconnect: [
        { id: 2 },
        { id: 4 }
      ], 
    }
  }
}
```

:::

:::::
::::::

## `set`

Using `set` performs a full update, replacing all existing relations with the ones specified, in the order specified.

`set` accepts a shorthand or a longhand syntax.

| Syntax type | Syntax example                  |
| ----------- | ------------------------------- |
| shorthand   | `set: [2, 4]`                   |
| longhand    | ```set: [ {id: 2}, {id: 4} ]``` |

As `set` replaces all existing relations, it should not be used in combination with other parameters. To perform a partial update, use [`connect`](#connect) and [`disconnect`](#disconnect).

::: note Omitting set
Omitting any parameter is equivalent to using `set`.<br/>For instance, the following 3 syntaxes are all equivalent:

- `data: { categories: set: [ {id: 2}, {id: 4} ] }}`
- `data: { categories: set: [2, 4] }}`
- `data: { categories: [2, 4] }` (as used in the [REST API documentation](/developer-docs/latest/developer-resources/database-apis-reference/rest-api.md#update-an-entry))
:::

:::::: tabs card

::::: tab Shorthand syntax example

::: request Example request using the shorthand syntax with set

`PUT http://localhost:1337/api/restaurants/1`

```json
{
  data: {
    categories: { 
      set: [2, 4],
    }
  }
}
```

:::

:::::

::::: tab Longhand syntax example

::: request Example request using the longhand syntax with set

`PUT http://localhost:1337/api/restaurants/1`

```json
{
  data: {
    categories: { 
      set: [
        { id: 2 },
        { id: 4 }
      ], 
    }
  }
}
```

:::

:::::
::::::
