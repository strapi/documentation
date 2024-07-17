---
title: Relations
description: Use the REST API to manage the order of relations
displayed_sidebar: restApiSidebar
---

# Managing relations through the REST API

Defining relations between content-types (that are designated as entities in the database layers) is connecting entities with each other.

Relations between content-types can be managed through the [admin panel](/user-docs/content-manager/managing-relational-fields#managing-multiple-choices-relational-fields) or through [REST](/dev-docs/api/rest) requests sent to the Content API.

Relations can be connected, disconnected or set through the Content API by passing parameters in the body of the request:

|  Parameter name | Description | Type of update |
|-----------------|------------------|----------------|
| [`connect`](#connect)       | Connects new entities.<br /><br />Can be used in combination with `disconnect`.<br /><br />Can be used with [positional arguments](#relations-reordering) to define an order for relations.    | Partial
| [`disconnect`](#disconnect)    | Disconnects entities.<br /><br />Can be used in combination with `connect`. | Partial
| [`set`](#set)           | Set entities to a specific set. Using `set` will overwrite all existing connections to other entities.<br /><br />Cannot be used in combination with `connect` or `disconnect`.  | Full

## `connect`

Using `connect` in the body of a request performs a partial update, connecting the specified relations.

`connect` accepts either a shorthand or a longhand syntax. In the following examples, numbers refers to entity ids:

| Syntax type | Syntax example |
| ------------|----------------|
| shorthand   | `connect: [2, 4]`
| longhand    | ```connect: [{ id: 2 }, { id: 4 }]``` |

You can also use the longhand syntax to [reorder relations](#relations-reordering).

`connect` can be used in combination with [`disconnect`](#disconnect).

:::caution
`connect` can not be used for media attributes (see [Upload plugin documentation](/dev-docs/plugins/upload#examples) for more details).
:::

<Tabs groupId="shorthand-longhand">

<TabItem value="shorthand" label="Shorthand syntax example">

Sending the following request updates the `restaurant` entity with `id` `1`, using the `categories` attribute to connect the entity with entities with `id` `2` and `4`:

<MultiLanguageSwitcher title="Example request using the shorthand syntax">
<MultiLanguageSwitcherRequest language="REST">

`PUT` `http://localhost:1337/api/restaurants/1`

```json
{
  data: {
    categories: {
      connect: [2, 4]
    }
  }
}
```

</MultiLanguageSwitcherRequest>

<MultiLanguageSwitcherRequest language="Node">

```js
const fetch = require('node-fetch');

const response = await fetch(
  'http://localhost:1337/api/restaurants/1',
  {
    method: 'put',
    body: {
      data: {
        categories: {
          connect: [2, 4]
        }
      }
    }
  }
);
```

</MultiLanguageSwitcherRequest>
</MultiLanguageSwitcher>

</TabItem>

<TabItem value="longhand" label="Longhand syntax example">

Sending the following request updates the `restaurant` entity with `id` `1`, using the `categories` attribute to connect the entity with entities with `id` `2` and `4`:

<MultiLanguageSwitcher title="Example request using the longhand syntax">
<MultiLanguageSwitcherRequest language="REST">

`PUT` `http://localhost:1337/api/restaurants/1`

```json
{
  data: {
    categories: {
      connect: [
        { id: 2 },
        { id: 4 }
      ]
    }
  }
}
```

</MultiLanguageSwitcherRequest>

<MultiLanguageSwitcherRequest language="Node">

```js
const fetch = require('node-fetch');

const response = await fetch(
  'http://localhost:1337/api/restaurants/1',
  {
    method: 'put',
    body: {
      data: {
        categories: {
          connect: [
            { id: 2 },
            { id: 4 }
          ]
        }
      }
    }
  }
);
```

</MultiLanguageSwitcherRequest>
</MultiLanguageSwitcher>

</TabItem>
</Tabs>

### Relations reordering

Positional arguments can be passed to the longhand syntax of `connect` to define the order of relations.

The longhand syntax accepts an array of objects, each object containing the `id` of the entry to be connected and an optional `position` object to define where to connect the relation.

:::note Different syntaxes for different relations
The syntaxes described in this documentation are useful for one-to-many, many-to-many and many-ways relations.<br />For one-to-one, many-to-one and one-way relations, the syntaxes are also supported but only the last relation will be used, so it's preferable to use a shorter format (e.g.: `{ data: { category: 2 } }`, see [REST API documentation](/dev-docs/api/rest#requests)).
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

:::caution
The same relation should not be connected more than once, otherwise it would return a Validation error by the API.
:::

<Tabs>

<TabItem value="basic" label="Basic example">

Consider the following record in the database:

```json
categories: [
  { id: 1 }
  { id: 2 }
]
```

Sending the following request updates the `restaurant` entity with `id` `1`, connecting a relation of entity with `id` `3` for the `categories` attribute and positioning it before the entity with `id` `2`:

<Request title="Example request to update the position of one relation">

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

</Request>
</TabItem>

<TabItem value="combined" label="Combined example">

Consider the following record in the database:

```json
categories: [
  { id: 1 }
  { id: 2 }
]
```

Sending the following example in the request body of a PUT request updates multiple relations:

<Request title="Example request to reorder several relations">

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

</Request>

Omitting the `position` argument (as in `id: 9`) defaults to `position: { end: true }`. All other relations are positioned relative to another existing `id` (using `after` or `before`) or relative to the list of relations (using `start` or `end`). Operations are treated sequentially in the order defined in the `connect` array, so the resulting database record will be the following:

```json
categories: [
  { id: 10 },
  { id: 1 },
  { id: 6 },
  { id: 7 },
  { id: 2 },
  { id: 8 },
  { id: 9 }
]
```

</TabItem>

</Tabs>

## `disconnect`

Using `disconnect` in the body of a request performs a partial update, disconnecting the specified relations.

`disconnect` accepts either a shorthand or a longhand syntax. In the following examples, numbers refers to entity ids:

| Syntax type | Syntax example |
| ------------|----------------|
| shorthand   | `disconnect: [2, 4]`
| longhand    | ```disconnect: [{ id: 2 }, { id: 4 }]``` |

`disconnect` can be used in combination with [`connect`](#connect).

<br />

<Tabs groupId="shorthand-longhand">

<TabItem value="shorthand" label="Shorthand syntax example">

Sending the following request updates the `restaurant` entity with `id` `1`, disconnecting the relations with entities with `id` `2` and `4`:

<Request title="Example request using the shorthand syntax">

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

</Request>

</TabItem>

<TabItem value="longhand" label="Longhand syntax example">

Sending the following request updates the `restaurant` entity with `id` `1`, disconnecting the relations with entities with `id` `2` and `4`:

<Request title="Example request using the longhand syntax">

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

</Request>

</TabItem>
</Tabs>

## `set`

Using `set` performs a full update, replacing all existing relations with the ones specified, in the order specified.

`set` accepts a shorthand or a longhand syntax. In the following examples, numbers refers to entity ids:

| Syntax type | Syntax example                  |
| ----------- | ------------------------------- |
| shorthand   | `set: [2, 4]`                   |
| longhand    | ```set: [{ id: 2 }, { id: 4 }]``` |

As `set` replaces all existing relations, it should not be used in combination with other parameters. To perform a partial update, use [`connect`](#connect) and [`disconnect`](#disconnect).

:::note Omitting set
Omitting any parameter is equivalent to using `set`.<br/>For instance, the following 3 syntaxes are all equivalent:

- `data: { categories: { set: [{ id: 2 }, { id: 4 }] }}`
- `data: { categories: { set: [2, 4] }}`
- `data: { categories: [2, 4] }` (as used in the [REST API documentation](/dev-docs/api/rest#update-an-entry))

:::

<Tabs groupId="shorthand-longhand">

<TabItem value="shorthand" label="Shorthand syntax example">

Sending the following request updates the `restaurant` entity with `id` `1`, replacing all previously existing relations and using the `categories` attribute to connect the entity with entities with `id` `2` and `4`:

<Request title="Example request using the shorthand syntax with set">

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

</Request>

</TabItem>

<TabItem value="longhand" label="Longhand syntax example">

Sending the following request updates the `restaurant` entity with `id` `1`, replacing all previously existing relations and using the `categories` attribute to connect the entity with entities with `id` `2` and `4`:

<Request title="Example request using the longhand syntax with set">

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

</Request>

</TabItem>
</Tabs>

<FeedbackPlaceholder />
