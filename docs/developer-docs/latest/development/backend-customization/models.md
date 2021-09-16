---
title: Models - Strapi Developer Documentation
description: (…)
sidebarDepth: 3
---

<!-- TODO: update SEO -->

# Models

Models are a representation of the data structure.

## Model creation

::: strapi Creating models with the Content-Types Builder
If you are just starting out, it is very convenient to generate some models with the Content-Types Builder directly in the admin interface. You can then review the generated model mappings at the code level. The UI takes over a lot of validation tasks and gives you a feeling for available features.
:::

**Content-Type** models can be created:

- with the [Content-Types Builder in the admin panel](/user-docs/latest/content-types-builder/introduction-to-content-types-builder.md),
- or with [Strapi's CLI `generate:model`](/developer-docs/latest/developer-resources/cli/CLI.md#strapi-generate-model) command.

Creating a Content-Type generates 2 files:

- `schema.json` for the model's [schema](#model-schema) definition,
- `lifecycles.js` for [lifecycle hooks](#lifecycle-hooks).

**Component** models can't be created with CLI tools. Use the Content-Type Builder or create them manually.

### Files location

For Content-Types models, any JavaScript or JSON file located in `./api/[api-name]/content-types/[content-type-name]/` folders will be loaded as a model (see [project structure](/developer-docs/latest/setup-deployment-guides/file-structure.md)).

The Components models are defined in the `./components` folder. Every component has to be inside a subfolder (the category name of the component).

## Model schema

The `schema.json` file of a model consists of [settings](#model-settings), [information](#model-information), [attributes](#model-attributes) and [options](#model-options).

### Model settings

General settings for the model can be configured with the following keys:

| Key                                          | Type   | Description                                                                                                            |
| -------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------- |
| `tableName`                                  | String | Collection name (or table name) in which the data should be stored.                                                    |
| `kind`<br><br>_Optional,<br>only for Content-Types_ | String | Defines if the model is:<ul><li>a Collection Type (`collectionType`)</li><li>or a Single Type (`singleType`)</li></ul> |

```json
// ./api/[api-name]/content-types/restaurant/schema.json

{
  "kind": "collectionType",
  "tableName": "Restaurants_v1",
}
```

### Model information

The `info` key in the model's schema states information about the model. This information is used in the admin interface when showing the model. It includes the following keys:

<!-- ? with the new design system, do we still use FontAwesome?  -->
<!-- ? if yes, what's the type of icon? a string (filepath?)? -->

| Key            | Type   | Description                                                                                                                                 |
| -------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `displayName`  | String | Default name to use in the admin panel                                                                                                      |
| `singularName` | String | Singular form of the Collection Type name.<br>Used to generate the API routes and databases/tables collection.<br><br>Should be kebab-case. |
| `pluralName`   | String | Plural form of the Collection Type name<br>Used to generate the API routes and databases/tables collection.<br><br>Should be kebab-case.    |
| `description`  | String | Description of the model.                                                                                                                   |
| `icon`<br><br>_Optional_ <br>_only for Components_       | ?      | Fontawesome V5 name                                                                                               |

```json
// ./api/[api-name]/content-types/restaurant/schema.json

  "info": {
    "displayName": "Restaurant",
    "singularName": "restaurant",
    "pluralName": "restaurants",
    "description": ""
  },
```

### Model attributes

Model attributes defines the data structure of your model.

#### Types

The following types are available:

| Type categories | Available attributes |
|------|-------|
| String types | <ul><li>`string`</li> <li>`text`</li> <li>`richtext`</li> <li>`enumeration`</li> <li>`email`</li> <li>`password`</li> <li>[`uid`<Fa-Link color="grey"/>](#uid-type)</li></ul> |
| Date types | <ul><li>`date`</li> <li>`time`</li> <li>`datetime`</li> <li>`timestamp`</li></ul> |
| Number types | <ul><li>`integer`</li> <li>`float`</li> <li>`decimal`</li> <li>`biginteger`</li></ul> |
| Other generic types |<ul><li>`json`</li> <li>`boolean`</li> <li>`array`</li> <li>`media`</li></ul> |
| [Internationalization](/developer-docs/latest/development/plugins/i18n.md)-related types |<ul><li>`locale`</li><li>`localizations`</li></ul> |
| Special types unique to Strapi |<ul><li>[`relation`<Fa-Link color="grey" size="1x"/>](#relations)</li><li>[`component`<Fa-Link color="grey" size="1x"/>](#components)</li><li>[`dynamiczone`<Fa-Link color="grey" size="1x"/>](#dynamic-zone)</li></ul> |



#### Validations

<!-- TODO: update this table once fully implemented -->

You can apply basic validations to attributes, using the following parameters:
<!-- - `unique` (boolean) — Whether to define a unique index on this property. not decided yet -->

| Parameter name | Type    | Description                                                                                               | Default |
| -------------- | ------- | --------------------------------------------------------------------------------------------------------- | ------- |
| `required`     | Boolean | If true, adds a required validator for this property.                                                     | `false` |
| `max`          | Integer | Checks if the value is greater than or equal to the given maximum.                                        | -       |
| `min`          | Integer | Checks if the value is less than or equal to the given minimum.                                           | -       |
| `maxLength`    | Integer | Maximum number of characters for a field input value                                                      | -       |
| `maxLength`    | Integer | Minimum number of characters for a field input value                                                      | -       |
| `private`      | boolean | If true, the attribute will be removed from the server response. (This is useful to hide sensitive data). | `false` |
| `configurable` | boolean | If false, the attribute isn't configurable from the Content-Types Builder plugin.                         | `true`  |


```json
// ./api/[api-name]/content-types/restaurant/schema.json

{
  ...
  "attributes": {
    "title": {
      "type": "string",
      "minLength": 3,
      "maxLength": 99,
      "unique": true
    },
    "description": {
      "default": "My description",
      "type": "text",
      "required": true
    },
    "slug": {
      "type": "uid",
      "targetField": "title"
    }
    ...
  }
}
```

#### `uid` type

<!-- TODO: review explanations -->
The `uid` type is used to automatically prefill the field value in the admin panel with unique ids (e.g. slugs for articles) based on 2 optional parameters:

- `targetField`(string): The field to use to auto-generate the uid.
- `options` (string): The value is a set of options passed to [the underlying `uid` generator](https://github.com/sindresorhus/slugify). A caveat is that the resulting `uid` must abide to the following RegEx `/^[A-Za-z0-9-_.~]*$`.

#### Relations

Relations let you create links (relations) between your Content Types.
They should be explicitly defined in the model's attributes, using the following keys:

<!-- TODO: describe polymorphic relations once implemented, or maybe just go with documenting the 'link' type -->
| Key                         | Description                                                                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `type: 'relation'`<br><br>⚠️ _Mandatory_<br><br>  |       Defines this field is a relation                                                                                            |
| `relation`                  | The type of relation among these values:<ul><li>`oneToOne`</li><li>`oneToMany`</li><li>`manyToOne`</li>`manyToMany`</li></ul>                   |
| `target`                    | Accepts a string value as the name of the target Content Type                                                                                   |
| `mappedBy` and `inversedBy` | _Optional_<br><br>In bidirectional relations, the owning side declares the `inversedBy` key while the inversed side declares the `mappedBy` key |

::::: tabs card

:::: tab One-to-One

One-to-One relationships are useful when one entry can be linked to only one other entry.

They can be unidirectional or bidirectional. In unidirectional relationships, only one of the models can be queried with its linked item.

::: details Unidirectional use case example:

  - A blog article belongs to a category.
  - Querying an article can retrieve its category,
  - but querying a category won't retrieve the list of articles.

  ```js
  // ./api/[api-name]/content-types/article/schema.json

  const model = {
    attributes: {
      category: {
        type: 'relation',
        relation: 'oneToOne',
        target: 'category',
      },
    },
  };
  ```

:::

::: details Bidirectional use case example:

  - A blog article belongs to a category.
  - Querying an article can retrieve its category,
  - and querying a category also retrieves its list of articles.

  ```js
  // ./api/[api-name]/content-types/article/schema.json

  const model = {
    attributes: {
      category: {
        type: 'relation',
        relation: 'oneToOne',
        target: 'category',
        inversedBy: 'article',
      },
    },
  };


  // ./api/[api-name]/content-types/category/schema.json

  const model = {
    attributes: {
      article: {
        type: 'relation',
        relation: 'oneToOne',
        target: 'article',
        mappedBy: 'category',
      },
    },
  };

  ```

:::

::::

:::: tab One-to-Many

One-to-Many relationships are useful when:

- an entry from a Content-Type A is linked to many entries of another Content-Type B,
- while an entry from Content-Type B is linked to only one entry of Content-Type A.

One-to-many relationships are always bidirectional, and are usually defined with the corresponding Many-to-One relationship:

::: details Example:
A person can own many plants, but a plant is owned by only one person.

```js
// ./api/[api-name]/content-types/plant/schema.json

const model = {
  attributes: {
    owner: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::person.person',
      inversedBy: 'plants',
    },
  },
};

// ./api/person/models/schema.json

const model = {
  attributes: {
    plants: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::plant.plant',
      mappedBy: 'owner',
    },
  },
};
```

:::

::::

:::: tab Many-to-One

Many-to-One relationships are useful to link many entries to one entry.

They can be unidirectional or bidirectional. In unidirectional relationships, only one of the models can be queried with its linked item.

::: details Unidirectional use case example:

  A book can be written by many authors.

  ```js
  // .api/[api-name]/content-types/book/schema.json

  const model = {
    attributes: {
      author: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'author',
      },
    },
  };

  ```

:::

::: details Bidirectional use case example:

  An article belongs to only one category but a category has many articles.

  ```js
  // .api/[api-name]/content-types/article/schema.json

  const model = {
    attributes: {
      author: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'category',
        inversedBy: 'article',
      },
    },
  };


  // .api/[api-name]/content-types/category/schema.json

  const model = {
    attributes: {
      books: {
        type: 'relation',
        relation: 'oneToMany',
        target: 'article',
        mappedBy: 'category',
      },
    },
  };
  ```
:::

::::

:::: tab Many-to-Many

Many-to-Many relationships are useful when:

- an entry from Content-Type A is linked to many entries of Content-Type B,
- and an entry from Content-Type B is also linked to many entries from Content-Type A.

Many-to-many relationships can be unidirectional or bidirectional. In unidirectional relationships, only one of the models can be queried with its linked item.

::: details Unidirectional use case example:

  ```js
  const model = {
    attributes: {
      categories: {
        type: 'relation',
        relation: 'manyToMany',
        target: 'category',
      },
    },
  };
  ```

:::

::: details Bidirectional use case example:

An article can have many tags and a tag can be assigned to many articles.

  ```js
  // .api/[api-name]/content-types/article/schema.json

  const model = {
    attributes: {
      tags: {
        type: 'relation',
        relation: 'manyToMany',
        target: 'tag',
        inversedBy: 'articles',
      },
    },
  };


  // .api/[api-name]/content-types/tag/schema.json

  const model = {
    attributes: {
      articles: {
        type: 'relation',
        relation: 'manyToMany',
        target: 'article',
        mappedBy: 'tag',
      },
    },
  };
  ```

:::

<!-- ? not sure what to do with this note and the following example, that's why I commented them for now -->
<!-- :::tip NOTE
The `tableName` key defines the name of the join table. It has to be specified once. If it is not specified, Strapi will use a generated default one. It is useful to define the name of the join table when the name generated by Strapi is too long for the database you use.
:::

**Path —** `./api/category/models/Category.settings.json`.

```js
{
  "attributes": {
    "products": {
      "collection": "product",
      "via": "categories"
    }
  }
}
``` -->
::::

:::::

#### Components

Component fields let your create a relation between your Content Type and a Component structure. They accept the following additional parameters:

<!-- ? what does the "that let you create a list of data" mean for the `repeatable` parameter means? -->

| Parameter    | Type    | Description                                                                              |
| ------------ | ------- | ---------------------------------------------------------------------------------------- |
| `repeatable` | Boolean | Could be `true` or `false` depending on whether the component is repeatable or not       |
| `component`  | String  | Define the corresponding component, following this format: `<category>.<componentName>`  |

```json
// ./api/[apiName]/restaurant/content-types/schema.json

{
  "attributes": {
    "openinghours": {
      "type": "component",
      "repeatable": true,
      "component": "restaurant.openinghours"
    }
  }
}
```


#### Dynamic Zone

Dynamic Zone fields let you create a flexible space in which to compose content, based on a mixed list of components.

They accept a `components` array that follows this format: `<category>.<componentName>`.

```json
// ./api/[api-name]/content-types/article/schema.json

{
  "attributes": {
    "body": {
      "type": "dynamiczone",
      "components": ["article.slider", "article.content"]
    }
  }
}
```

### Model options

The `options` key on the in the model description can use the following keys:

| Key                     | Type                        | Description                                                                                                                                                                                                                                                                                                                                  |
| ----------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `privateAttributes`     | Array of strings            | This configuration allows to treat a set of attributes as private, even if they're not actually defined as attributes in the model. It could be used to remove from API responses timestamps.<br><br>The set of `privateAttributes` defined in the model are merged with the `privateAttributes` defined in the global Strapi configuration. |
| `populateCreatorFields` | Boolean                     | Configure whether the API response should include `created_by` and `updated_by` fields or not.<br><br>Default value: `false`                                                                                                                                                                                                                 |
| `draftAndPublish`       | Boolean                     | Enable the draft and publish feature.<br><br>Default value: `false`                                                                                                                                                                                                                                                                          |


```json
// .api/[api-name]/content-types/restaurant/schema.json

{
  "options": {
    "timestamps": true,
    "privateAttributes": ["id", "created_at"],
    "populateCreatorFields": true,
    "draftAndPublish": false
  }
}
```

## Lifecycle hooks

The lifecycle hooks are functions that get triggered when the Strapi queries are called. They are triggered automatically when you manage your content in the Admin Panel or when you develop custom code using `queries`·

:::caution
Lifecycles hooks are not triggered when using directly the knex library instead of Strapi functions.
:::

### Available lifecycle events

The following lifecycle events are available:

- `beforeCreate`
- `beforeCreateMany`
- `afterCreate`
- `afterCreateMany`
- `beforeUpdate`
- `beforeUpdateMany`
- `afterUpdate`
- `afterUpdateMany`
- `beforeDelete`
- `beforeDeleteMany`
- `afterDelete`
- `afterDeleteMany`
- `beforeCount`
- `afterCount`
- `beforeFindOne`
- `afterFindOne`
- `beforeFindMany`
- `afterFindMany`

### Hook `event` object

Lifecycle hooks are functions that take an `event` parameter, an object with the following keys:

| Key      | Type              | Description                                                                                                                                                      |
| -------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `action` | string            | Lifecycle event that has been triggered (see [list](#available-lifecycle-events))                                                                                |
| `model`  | string            | Model name                                                                                                                                                       |
| `em`     | ?           | the EntityManager |                                                                                                                                                    |
| `params` | object            | Accepts the following parameters:<ul><li>`data`</li><li>`select`</li><li>`where`</li><li>`orderBy`</li><li>`limit`</li><li>`offset`</li><li>`populate`</li></ul> |
| `result` | object            | _Optional, only available with `afterXXX` events_<br><br>Contains the result of the action.                                                                      |
| `state`  | object            | Query state, can be used to share state between `beforeXXX` and `afterXXX` events of a same query.                                                               |
<!-- TODO: `state` has not been implemented yet, ask for more info once done -->

You can customize lifecycle hooks declaratively or programmatically.
### Declarative usage

To configure a Content-Type lifecycle hook, create a `lifecycles.js` file located in the `./api/[api-name]/content-types/[content-type-name]/` folder.

Each event listener is called sequentially. They can be synchronous or asynchronous.

```js
// ./api/[api-name]/content-types/restaurant/lifecycles.js

module.exports = {
  beforeCreate(event: Event) {
    const { data, where, select, populate } = event.params;

    // let's do a 20% discount everytime
    event.params.data.price = event.params.data.price * 0.8;
  },

  afterCreate(event: Event) {
    const { result, params } = event;

    // do something to the result;
  },
};
```

### Programmatic usage

Using the database layer API, it's possible to register a subscriber and listen to events programmatically:


```js
// ./api/[api-name]/content-types/restaurant/lifecycles.js

// registering a subscriber
strapi.db.lifecycles.subscribe({
  models: [], // optional;

  beforeCreate(event: Event) {
    const { data, where, select, populate } = event.params;

    event.state = 'doStuffAfterWards';
  },

  afterCreate(event: Event) {
    if (event.state === 'doStuffAfterWards') {
    }

    const { result, params } = event;

    // do something to the result
  },
});

// generic subscribe for generic handling
strapi.db.lifecycles.subscribe((event) => {
  if (event.action === 'beforeCreate') {
    // do something
  }
});
```
