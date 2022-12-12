---
title: Reordering relations
description: Use the REST API to manage the order of relations
canonicalUrl: https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/relations-reordering.html
---

# Managing relations through the REST API <BetaBadge />

Relations between content-types can be managed through the [admin panel](/user-docs/latest/content-manager/managing-relational-fields.md#managing-multiple-choices-relational-fields) or through REST requests sent to the Content API.

Relations can be added, updated, or removed through the Content API. The `connect`, `disconnect`, and `set` attributes, passed in the body of POST or PUT requests, have different behaviors:

- `connect` and `disconnect` perform partial updates
- `set` performs a full update, effectively replacing all existing relations

`connect` and `disconnect` can be passed together while `set` should be used alone.

```json
/** 
 * Partial update (will add/remove the specified relations)
 */

// Using the shorthand syntax
{
  data: {
    categories: { 
      connect: [2, 4],
      disconnect: [5]
    }
  }
}

// Using the longhand syntax
{
  data: {
    categories: { 
      connect: [
        { id: 2 },
        { id: 4 }
      ], 
      disconnect: [
        { id: 5 }
      ]
    }
  }
}

/**
 * Full update (will delete all current relations and set those ones instead)
 */

// Using the shorthand syntax
{
  data: {
    categories: { set: [2, 4] }
  }
}

// Using the longhand syntax
{
  data: {
    categories: {
      set: [
        { id: 2 },
        { id: 4 }
      ]
    }
  }
}
```

Using the longhand syntax with `connect` allows adding [positional arguments](#longhand-syntax) to define an order for relations.

## `connect`

Using `connect` in the body of a request performs a partial update, adding specified relations.

`connect` accepts either a shorthand or a longhand syntax.

### Shorthand syntax

With the shorthand syntax, pass an array of ids of relations to create.

**Example:**

Passing the following example of body request adds the `categories` entries with ids `2` and `4` to a content-type's relations:

```json
{
  data: {
    categories: { connect: [2, 4] }
  }
}
```

### Longhand syntax

With the longhand syntax, you can pass optional positional arguments to define the order of relations.

The longhand syntax accepts an array of objects, each object containing the `id` of the relation to be connected and an optional `position` object to define where to connect the relation.

`position` accepts 4 different positional attributes:

| Parameter name and syntax | Description |
|---------------------------|-------------|
| `before: id`              | Positions the relation before the given `id`. |
| `after: id`               | Positions the relation after the given `id`. |
| `start`                   | Positions the relation at the start of the existing list of relations. |
| `end`                     | Positions the relation at the end of the existing list of relations. |

The `position` argument is optional and defaults to `position: { end: true }`.

:::note Sequential order
Since `connect` is an array, the order of operations is important as they will be treated sequentially (see combined example below).
:::

**Examples:**

:::: tabs card

::: tab Basic example

Given the following record in the database:

```json
categories: [
  { id: 1, order: 1 }
  { id: 2, order: 2 }
]
```

sending the following in the request body of a PUT or POST request creates a third relation of `id` `3` and position it before the relation with `id` `2`:

```json
categories: {
  connect: [
    { id: 3, position: { before: 2 } }, // It should be placed before relation id=2
  ]
}
```

:::

::: tab Combined example

Sending the following example in the request body of a PUT or POST request updates multiple relations:

```json
categories: {
  connect: [
    // By default positional info will be end: true
    { id: 6, position: { after: 1} },    // It should be after relation with id 1
    { id: 7, position: { before: 2 }},   // It should be before relation with id 2
    { id: 8, position: { end: true }},   // It should be at the end
    { id: 9 },                           // It should also be at the end
    { id: 10, position: { start: true }} // It should be at the start
  ]
}
```

The resulting database record could be the following:

```json
categories: [
  { id: 10, order: 1},
  { id: 1, order: 2},
  { id: 6, order: 3},
  { id: 7, order: 4},
  { id: 2, order: 5},
  { id: 8, order: 6},
  { id: 9, order: 7}
]
```

:::

::::

## `disconnect`

Using `disconnect` in the body of a request performs a partial update, removing specified relations.

`disconnect` accepts either a shorthand or a longhand syntax.

### Shorthand syntax

With the shorthand syntax, pass an array of ids of relations to be removed.

**Example:**

Passing the following example of a body request removes the categories with `id` `4` from the content type's relations:

```json
categories: {
  disconnect: [4]
}
```

### Longhand syntax

With the longhand syntax, pass an array of objects with the `id` property for each relation to remove.

**Example:**

Passing the following example of a body request removes the categories with the id 4 from the content type's relations:

```json
categories: {
  disconnect: [
    { id: 4 }
  ]
}
```

## `set`

Using `set` performs a full update, replacing all existing relations with the ones specified, in the order specified.

`set` accepts a shorthand or a longhand syntax.

### Shorthand syntax

With the shorthand syntax, pass an array of ids of relations to be set.

**Example:**

Passing the following example of a body request will override all existing relations previously defined for `categories` and replace them only with `id` `2` and `4`:

```json
{
  data: {
    categories: { set: [2, 4] }
  }
}
```

### Longhand syntax

With the longhand syntax, pass an array of objects with the `id` property for each relation to set.

**Example:**

Passing the following example of a body request will override all existing relations previously defined for `categories` and replace them only with `id` `2` and `4`:

```json
{
  data: {
    categories: { 
      set: [
        { id: 2 },
        { id: 4 }
      ]
    }
  }
}
```
