---
title: Relations
description: Use the REST API to manage the order of relations
displayed_sidebar: cmsSidebar
sidebar_label: Relations
tags:
- API 
- relations
- Content API
- disconnect
- REST API
---

# Managing relations with API requests

Defining relations between content-types (that are designated as entities in the database layers) is connecting entities with each other.

Relations between content-types can be managed through the [admin panel](/cms/content-manager/managing-relational-fields#managing-multiple-choice-relational-fields) or through [REST API](/cms/api/rest) or [Document Service API](/cms/api/document-service) requests.

Relations can be connected, disconnected or set through the Content API by passing parameters in the body of the request:

|  Parameter name         | Description | Type of update |
|-------------------------|-------------|----------------|
| [`connect`](#connect)   | Connects new entities.<br /><br />Can be used in combination with `disconnect`.<br /><br />Can be used with [positional arguments](#relations-reordering) to define an order for relations.    | Partial |
| [`disconnect`](#disconnect)    | Disconnects entities.<br /><br />Can be used in combination with `connect`. | Partial |
| [`set`](#set)           | Set entities to a specific set. Using `set` will overwrite all existing connections to other entities.<br /><br />Cannot be used in combination with `connect` or `disconnect`.  | Full |

:::note
When [Internationalization (i18n)](/cms/content-manager/translating-content) is enabled on the content-type, you can also pass a locale to set relations for a specific locale, as in this Document Service API example:

```js
await strapi.documents('api::restaurant.restaurant').update({ 
  documentId: 'a1b2c3d4e5f6g7h8i9j0klm',
  locale: 'fr',
  data: { 
    category: {
      connect: ['z0y2x4w6v8u1t3s5r7q9onm', 'j9k8l7m6n5o4p3q2r1s0tuv']
    }
  }
})
```

If no locale is passed, the default locale will be assumed.
:::

## `connect`

Using `connect` in the body of a request performs a partial update, connecting the specified relations.

`connect` accepts either a shorthand or a longhand syntax:

| Syntax type | Syntax example |
| ------------|----------------|
| shorthand   | `connect: ['z0y2x4w6v8u1t3s5r7q9onm', 'j9k8l7m6n5o4p3q2r1s0tuv']` |
| longhand    | ```connect: [{ documentId: 'z0y2x4w6v8u1t3s5r7q9onm' }, { documentId: 'j9k8l7m6n5o4p3q2r1s0tuv' }]``` |

You can also use the longhand syntax to [reorder relations](#relations-reordering).

`connect` can be used in combination with [`disconnect`](#disconnect).

:::caution
`connect` can not be used for media attributes (see [Upload plugin documentation](/cms/plugins/upload#examples) for more details).
:::

<Tabs groupId="shorthand-longhand">

<TabItem value="shorthand" label="Shorthand syntax example">

Sending the following request updates a `restaurant`, identified by its `documnentId` `a1b2c3d4e5f6g7h8i9j0klm`. The request uses the `categories` attribute to connect the restaurant with 2 categories identified by their `documentId`:

<MultiLanguageSwitcher title="Example request using the shorthand syntax">
<MultiLanguageSwitcherRequest language="REST">

`PUT` `http://localhost:1337/api/restaurants/a1b2c3d4e5f6g7h8i9j0klm`

```js
{
  data: {
    categories: {
      connect: ['z0y2x4w6v8u1t3s5r7q9onm', 'j9k8l7m6n5o4p3q2r1s0tuv']
    }
  }
}
```

</MultiLanguageSwitcherRequest>

<MultiLanguageSwitcherRequest language="Node">

```js
const fetch = require('node-fetch');

const response = await fetch(
  'http://localhost:1337/api/restaurants/a1b2c3d4e5f6g7h8i9j0klm',
  {
    method: 'put',
    body: {
      data: {
        categories: {
          connect: ['z0y2x4w6v8u1t3s5r7q9onm', 'j9k8l7m6n5o4p3q2r1s0tuv']
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

Sending the following request updates a `restaurant`, identified by its `documnentId` `a1b2c3d4e5f6g7h8i9j0klm`. The request uses the `categories` attribute to connect the restaurant with 2 categories identified by their `documentId`:

<MultiLanguageSwitcher title="Example request using the longhand syntax">
<MultiLanguageSwitcherRequest language="REST">

`PUT` `http://localhost:1337/api/restaurants/a1b2c3d4e5f6g7h8i9j0klm`

```js
{
  data: {
    categories: {
      connect: [
        { documentId: 'z0y2x4w6v8u1t3s5r7q9onm' },
        { documentId: 'j9k8l7m6n5o4p3q2r1s0tuv' }
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
  'http://localhost:1337/api/restaurants/a1b2c3d4e5f6g7h8i9j0klm',
  {
    method: 'put',
    body: {
      data: {
        categories: {
          connect: [
            { documentId: 'z0y2x4w6v8u1t3s5r7q9onm' },
            { documentId: 'j9k8l7m6n5o4p3q2r1s0tuv' }
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

The longhand syntax accepts an array of objects, each object containing the `documentId` of the entry to be connected and an optional `position` object to define where to connect the relation.

:::note Different syntaxes for different relations
The syntaxes described in this documentation are useful for one-to-many, many-to-many and many-ways relations.<br />For one-to-one, many-to-one and one-way relations, the syntaxes are also supported but only the last relation will be used, so it's preferable to use a shorter format (e.g.: `{ data: { category: 'a1b2c3d4e5f6g7h8i9j0klm' } }`, see [REST API documentation](/cms/api/rest#requests)).
:::

To define the `position` for a relation, pass one of the following 4 different positional attributes:

| Parameter name and syntax | Description                                                            | Type       |
| ------------------------- | ---------------------------------------------------------------------- | ---------- |
| `before: documentId`      | Positions the relation before the given `documentId`.                  | `documentId` (string) |
| `after: documentId`       | Positions the relation after the given `documentId`.                   | `documentId` (string) |
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

```js
categories: [
  { documentId: 'j9k8l7m6n5o4p3q2r1s0tuv' }
  { documentId: 'z0y2x4w6v8u1t3s5r7q9onm' }
]
```

Sending the following request updates a `restaurant`, identified by its `documentId` `a1b2c3d4e5f6g7h8i9j0klm`, connecting a relation of entity with a `documentId` of `ma12bc34de56fg78hi90jkl` for the `categories` attribute and positioning it before the entity with `documentId` `z0y2x4w6v8u1t3s5r7q9onm`:

<Request title="Example request to update the position of one relation">

`PUT http://localhost:1337/api/restaurants/a1b2c3d4e5f6g7h8i9j0klm`

```js
{
  data: {
    categories: {
      connect: [
        { documentId: 'ma12bc34de56fg78hi90jkl', position: { before: 'z0y2x4w6v8u1t3s5r7q9onm' } },
      ]
    }
  }
}
```

</Request>
</TabItem>

<TabItem value="combined" label="Combined example">

Consider the following record in the database:

```js
categories: [
  { documentId: 'j9k8l7m6n5o4p3q2r1s0tuv' }
  { documentId: 'z0y2x4w6v8u1t3s5r7q9onm' }
]
```

Sending the following example in the request body of a PUT request updates multiple relations:

<Request title="Example request to reorder several relations">

`PUT http://localhost:1337/api/restaurants/a1b2c3d4e5f6g7h8i9j0klm`

```js
{
  data: {
    categories: {
      connect: [
        { id: '6u86wkc6x3parjd4emikhmx', position: { after: 'j9k8l7m6n5o4p3q2r1s0tuv'} },
        { id: '3r1wkvyjwv0b9b36s7hzpxl', position: { before: 'z0y2x4w6v8u1t3s5r7q9onm' } },
        { id: 'rkyqa499i84197l29sbmwzl', position: { end: true } },
        { id: 'srkvrr77k96o44d9v6ef1vu' },
        { id: 'nyk7047azdgbtjqhl7btuxw', position: { start: true } },
      ]
    }
  }
}
```

</Request>

Omitting the `position` argument (as in `documentId: 'srkvrr77k96o44d9v6ef1vu9'`) defaults to `position: { end: true }`. All other relations are positioned relative to another existing `id` (using `after` or `before`) or relative to the list of relations (using `start` or `end`). Operations are treated sequentially in the order defined in the `connect` array, so the resulting database record will be the following:

```js
categories: [
  { id: 'nyk7047azdgbtjqhl7btuxw' },
  { id: 'j9k8l7m6n5o4p3q2r1s0tuv' },
  { id: '6u86wkc6x3parjd4emikhmx6' },
  { id: '3r1wkvyjwv0b9b36s7hzpxl7' },
  { id: 'a1b2c3d4e5f6g7h8i9j0klm' },
  { id: 'rkyqa499i84197l29sbmwzl' },
  { id: 'srkvrr77k96o44d9v6ef1vu9' }
]
```

</TabItem>

</Tabs>

### Edge cases: Draft & Publish or i18n disabled

When some built-in features of Strapi 5 are disabled for a content-type, such as [Draft & Publish](/cms/content-manager/saving-and-publishing-content) and [Internationalization (i18)](/cms/content-manager/translating-content), the `connect` parameter might be used differently:

**Relation from a `Category` with i18n _off_ to an `Article` with i18n _on_:**

In this situation you can select which locale you are connecting to:

```js
data: {
    categories: {
      connect: [
        { documentId: 'z0y2x4w6v8u1t3s5r7q9onm', locale: 'en' },
        // Connect to the same document id but with a different locale 👇
        { documentId: 'z0y2x4w6v8u1t3s5r7q9onm', locale: 'fr' },
      ]
   }
}
```

**Relation from a `Category` with Draft & Publish _off_ to an `Article` with Draft & Publish _on_:**

```js
data: {
  categories: {
    connect: [
      { documentId: 'z0y2x4w6v8u1t3s5r7q9onm', status: 'draft' },
      // Connect to the same document id but with different publication states 👇
      { documentId: 'z0y2x4w6v8u1t3s5r7q9onm', status: 'published' },
    ]
  }
}
```

## `disconnect`

Using `disconnect` in the body of a request performs a partial update, disconnecting the specified relations.

`disconnect` accepts either a shorthand or a longhand syntax:

| Syntax type | Syntax example |
| ------------|----------------|
| shorthand   | `disconnect: ['z0y2x4w6v8u1t3s5r7q9onm', 'j9k8l7m6n5o4p3q2r1s0tuv']`
| longhand    | ```disconnect: [{ documentId: 'z0y2x4w6v8u1t3s5r7q9onm' }, { documentId: 'j9k8l7m6n5o4p3q2r1s0tuv' }]``` |

`disconnect` can be used in combination with [`connect`](#connect).

<br />

<Tabs groupId="shorthand-longhand">

<TabItem value="shorthand" label="Shorthand syntax example">

Sending the following request updates a `restaurant`, identified by its `documentId` `a1b2c3d4e5f6g7h8i9j0klm`, disconnecting the relations with 2 entries identified by their `documentId`:

<Request title="Example request using the shorthand syntax">

`PUT http://localhost:1337/api/restaurants/a1b2c3d4e5f6g7h8i9j0klm`

```js
{
  data: {
    categories: {
      disconnect: ['z0y2x4w6v8u1t3s5r7q9onm', 'j9k8l7m6n5o4p3q2r1s0tuv'],
    }
  }
}
```

</Request>

</TabItem>

<TabItem value="longhand" label="Longhand syntax example">

Sending the following request updates a `restaurant`, identified by its `documentId` `a1b2c3d4e5f6g7h8i9j0klm`, disconnecting the relations with 2 entries identified by their `documentId`:

<Request title="Example request using the longhand syntax">

`PUT http://localhost:1337/api/restaurants/a1b2c3d4e5f6g7h8i9j0klm`

```js
{
  data: {
    categories: {
      disconnect: [
        { documentId: 'z0y2x4w6v8u1t3s5r7q9onm' },
        { documentId: 'j9k8l7m6n5o4p3q2r1s0tuv' }
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

`set` accepts a shorthand or a longhand syntax:

| Syntax type | Syntax example                  |
| ----------- | ------------------------------- |
| shorthand   | `set: ['z0y2x4w6v8u1t3s5r7q9onm', 'j9k8l7m6n5o4p3q2r1s0tuv']`                   |
| longhand    | ```set: [{ documentId: 'z0y2x4w6v8u1t3s5r7q9onm' }, { documentId: 'j9k8l7m6n5o4p3q2r1s0tuv' }]``` |

As `set` replaces all existing relations, it should not be used in combination with other parameters. To perform a partial update, use [`connect`](#connect) and [`disconnect`](#disconnect).

:::note Omitting set
Omitting any parameter is equivalent to using `set`.<br/>For instance, the following 3 syntaxes are all equivalent:

- `data: { categories: set: [{ documentId: 'z0y2x4w6v8u1t3s5r7q9onm' }, { documentId: 'j9k8l7m6n5o4p3q2r1s0tuv' }] }}`
- `data: { categories: set: ['z0y2x4w6v8u1t3s5r7q9onm2', 'j9k8l7m6n5o4p3q2r1s0tuv'] }}`
- `data: { categories: ['z0y2x4w6v8u1t3s5r7q9onm2', 'j9k8l7m6n5o4p3q2r1s0tuv'] }`

:::

<Tabs groupId="shorthand-longhand">

<TabItem value="shorthand" label="Shorthand syntax example">

Sending the following request updates a `restaurant`, identified by its `documentId` `a1b2c3d4e5f6g7h8i9j0klm`, replacing all previously existing relations and using the `categories` attribute to connect 2 categories identified by their `documentId`:

<Request title="Example request using the shorthand syntax with set">

`PUT http://localhost:1337/api/restaurants/a1b2c3d4e5f6g7h8i9j0klm`

```js
{
  data: {
    categories: {
      set: ['z0y2x4w6v8u1t3s5r7q9onm', 'j9k8l7m6n5o4p3q2r1s0tuv4'],
    }
  }
}
```

</Request>

</TabItem>

<TabItem value="longhand" label="Longhand syntax example">

Sending the following request updates a `restaurant`, identified by its `documentId` `a1b2c3d4e5f6g7h8i9j0klm`, replacing all previously existing relations and using the `categories` attribute to connect 2 categories identified by their `documentId`:

<Request title="Example request using the longhand syntax with set">

`PUT http://localhost:1337/api/restaurants/a1b2c3d4e5f6g7h8i9j0klm`

```js
{
  data: {
    categories: {
      set: [
        { documentId: 'z0y2x4w6v8u1t3s5r7q9onm' },
        { documentId: 'j9k8l7m6n5o4p3q2r1s0tuv' }
      ],
    }
  }
}
```

</Request>

</TabItem>
</Tabs>

<FeedbackPlaceholder />
