---
title: Models - Strapi Developer Docs
description: Strapi models (i.e. content-types, components, and dynamic zones) define a representation of the data structure.
sidebarDepth: 3
canonicalUrl: https://docs.strapi.io/developer-docs/latest/development/backend-customization/models.html
---

# Models

As Strapi is a headless Content Management System (CMS), creating a data structure for the content is one of the most important aspects of using the software. Models define a representation of the data structure.

There are 2 different types of models in Strapi:

- content-types, which can be collection types or single types, depending on how many entries they manage,
- and components that are data structures re-usable in multiple content-types.

If you are just starting out, it is convenient to generate some models with the [Content-type Builder](/user-docs/latest/content-types-builder/introduction-to-content-types-builder.md) directly in the admin panel. The user interface takes over a lot of validation tasks and showcases all the options available to create the content's data structure. The generated model mappings can then be reviewed at the code level using this documentation.

## Model creation

Content-types and components models are created and stored differently.

### Content-types

Content-types in Strapi can be created:

- with the [Content-type Builder in the admin panel](/user-docs/latest/content-types-builder/introduction-to-content-types-builder.md),
- or with [Strapi's interactive CLI `strapi generate`](/developer-docs/latest/developer-resources/cli/CLI.md#strapi-generate) command.

The content-types use the following files:

- `schema.json` for the model's [schema](#model-schema) definition. (generated automatically, when creating content-type with either method)
- `lifecycles.js` for [lifecycle hooks](#lifecycle-hooks). This file must be created manually.

These models files are stored in `./src/api/[api-name]/content-types/[content-type-name]/`, and any JavaScript or JSON file found in these folders will be loaded as a content-type's model (see [project structure](/developer-docs/latest/setup-deployment-guides/file-structure.md)).

:::note
In [TypeScript](/developer-docs/latest/development/typescript.md)-enabled projects, schema typings can be generated using the `ts:generate-types` command.
:::

### Components

Component models can't be created with CLI tools. Use the [Content-type Builder](/user-docs/latest/content-types-builder/introduction-to-content-types-builder.md) or create them manually.

Components models are stored in the `./src/components` folder. Every component has to be inside a subfolder, named after the category the component belongs to (see [project structure](/developer-docs/latest/setup-deployment-guides/file-structure.md)).

## Model schema

The `schema.json` file of a model consists of:

- [settings](#model-settings), such as the kind of content-type the model represents or the table name in which the data should be stored,
- [information](#model-information), mostly used to display the model in the admin panel and access it through the REST and GraphQL APIs,
- [attributes](#model-attributes), which describe the data structure of the model,
- and [options](#model-options) used to defined specific behaviors on the model.

### Model settings

General settings for the model can be configured with the following parameters:

| Parameter                                          | Type   | Description                                                                                                            |
| -------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------- |
| `tableName`                                  | String | Database table name in which the data should be stored                                                    |
| `kind`<br><br>_Optional,<br>only for content-types_ | String | Defines if the content-type is:<ul><li>a collection type (`collectionType`)</li><li>or a single type (`singleType`)</li></ul> |

```json
// ./api/[api-name]/content-types/restaurant/schema.json

{
  "kind": "collectionType",
  "tableName": "Restaurants_v1",
}
```

### Model information

The `info` key in the model's schema describes information used to display the model in the admin panel and access it through the Content API. It includes the following parameters:

<!-- ? with the new design system, do we still use FontAwesome?  -->

| Parameter            | Type   | Description                                                                                                                                 |
| -------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `displayName`  | String | Default name to use in the admin panel                                                                                                      |
| `singularName` | String | Singular form of the content-type name.<br>Used to generate the API routes and databases/tables collection.<br><br>Should be kebab-case. |
| `pluralName`   | String | Plural form of the content-type name.<br>Used to generate the API routes and databases/tables collection.<br><br>Should be kebab-case.    |
| `description`  | String | Description of the model                                                                                                                   |
| `icon`<br><br>_Optional,_<br>_only for Components_       | String      | [FontAwesome](https://fontawesome.com/) (v5) icon name to use for the component's icon in the admin panel

```json
// ./src/api/[api-name]/content-types/restaurant/schema.json

  "info": {
    "displayName": "Restaurant",
    "singularName": "restaurant",
    "pluralName": "restaurants",
    "description": ""
  },
```

### Model attributes

The data structure of a model consists of a list of attributes. Each attribute has a `type` parameter, which describes its nature and defines the attribute as a simple piece of data or a more complex structure used by Strapi.

Many types of attributes are available:

- scalar types (e.g. strings, dates, numbers, booleans, etc.),
- Strapi-specific types, such as:
  - `media`, for files uploaded through the [Media library](/user-docs/latest/content-types-builder/configuring-fields-content-type.md#media)
  - `relation` to describe a [relation](#relations) between content-types
  - `component` to define a [component](#components-2) (i.e. a data structure usable in multiple content-types)
  - `dynamiczone` to define a [dynamic zone](#dynamic-zones) (i.e. a flexible space based on a list of components)
  - and the `locale` and `localizations` types, only used by the [Internationalization (i18n) plugin](/developer-docs/latest/plugins/i18n.md)

The `type` parameter of an attribute should be one of the following values:

| Type categories | Available types |
|------|-------|
| String types | <ul><li>`string`</li> <li>`text`</li> <li>`richtext`</li><li>`enumeration`</li> <li>`email`</li><li>`password`</li><li>[`uid`<Fa-Link color="grey"/>](#uid-type)</li></ul> |
| Date types | <ul><li>`date`</li> <li>`time`</li> <li>`datetime`</li> <li>`timestamp`</li></ul> |
| Number types | <ul><li>`integer`</li><li>`biginteger`</li><li>`float`</li> <li>`decimal`</li></ul> |
| Other generic types |<ul><li>`boolean`</li><li>`array`</li><li>`json`</li></ul> |
| Special types unique to Strapi |<ul><li>`media`</li><li>[`relation`<Fa-Link color="grey" size="1x"/>](#relations)</li><li>[`component`<Fa-Link color="grey" size="1x"/>](#components)</li><li>[`dynamiczone`<Fa-Link color="grey" size="1x"/>](#dynamic-zones)</li></ul> |
| Internationalization (i18n)-related types<br /><br />_Can only be used if the [i18n plugin](/developer-docs/latest/plugins/i18n.md) is installed_|<ul><li>`locale`</li><li>`localizations`</li></ul> |

#### Validations

Basic validations can be applied to attributes using the following parameters:

| Parameter | Type    | Description                                                                                               | Default |
| -------------- | ------- | --------------------------------------------------------------------------------------------------------- | ------- |
| `required`     | Boolean | If `true`, adds a required validator for this property                                                     | `false` |
| `max`          | Integer | Checks if the value is greater than or equal to the given maximum                                        | -       |
| `min`          | Integer | Checks if the value is less than or equal to the given minimum                                           | -       |
| `minLength`    | Integer | Minimum number of characters for a field input value                                                      | -       |
| `maxLength`    | Integer | Maximum number of characters for a field input value                                                      | -       |
| `private`      | Boolean | If `true`, the attribute will be removed from the server response.<br/><br/>💡 This is useful to hide sensitive data. | `false` |
| `configurable` | Boolean | If `false`, the attribute isn't configurable from the Content-type Builder plugin.                         | `true`  |

```json
// ./src/api/[api-name]/content-types/restaurant/schema.json

{
  // ...
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
    // ...
  }
}
```

#### Database validations and settings

:::caution 🚧 This API is considered experimental.
These settings should be reserved to an advanced usage, as they might break some features. There are no plans to make these settings stable.
:::

Database validations and settings are custom options passed directly onto the `tableBuilder` Knex.js function during schema migrations. Database validations allow for an advanced degree of control for setting custom column settings. The following options are set in a `column: {}` object per attribute:

| Parameter     | Type    | Description                                                                                   | Default |
| ------------- | ------- | --------------------------------------------------------------------------------------------- | ------- |
| `name`        | string  | Changes the name of the column in the database                                                | -       |
| `defaultTo`   | string  | Sets the database `defaultTo`, typically used with `notNullable`                              | -       |
| `notNullable` | boolean | Sets the database `notNullable`, ensures that columns cannot be null                          | `false` |
| `unsigned`    | boolean | Only applies to number columns, removes the ability to go negative but doubles maximum length | `false` |
| `unique`      | boolean | Enforces database level unique, caution when using with draft & publish feature               | `false` |
| `type`        | string  | Changes the database type, if `type` has arguments, you should pass them in `args`            | -       |
| `args`        | array   | Arguments passed into the Knex.js function that changes things like `type`                    | `[]`    |

```json
// ./src/api/[api-name]/content-types/restaurant/schema.json

{
  // ...
  "attributes": {
    "title": {
      "type": "string",
      "minLength": 3,
      "maxLength": 99,
      "unique": true,
      "column": {
        "unique": true // enforce database unique also
      }
    },
    "description": {
      "default": "My description",
      "type": "text",
      "required": true,
      "column": {
        "defaultTo": "My description", // set database level default
        "notNullable": true // enforce required at database level, even for drafts
      }
    },
    "rating": {
      "type": "decimal",
      "default": 0,
      "column": {
        "defaultTo": 0,
        "type": "decimal", // using the native decimal type but allowing for custom precision
        "args": [
          6,1 // using custom precision and scale
        ]
      }
    }
    // ...
  }
}
```

#### `uid` type

The `uid` type is used to automatically prefill the field value in the admin panel with a unique identifier (UID) (e.g. slugs for articles) based on 2 optional parameters:

- `targetField` (string): If used, the value of the field defined as a target is used to auto-generate the UID.
- `options` (string): If used, the UID is generated based on a set of options passed to [the underlying `uid` generator](https://github.com/sindresorhus/slugify). The resulting `uid` must match the following regular expression pattern: `/^[A-Za-z0-9-_.~]*$`.

#### Relations

Relations link content-types together. Relations are explicitly defined in the [attributes](#model-attributes)  of a model with `type: 'relation'`  and accept the following additional parameters:

| Parameter                         | Description                                                                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `relation`                  | The type of relation among these values:<ul><li>`oneToOne`</li><li>`oneToMany`</li><li>`manyToOne`</li>`manyToMany`</li></ul>                   |
| `target`                    | Accepts a string value as the name of the target content-type                                                                                   |
| `mappedBy` and `inversedBy`<br><br>_Optional_ | In bidirectional relations, the owning side declares the `inversedBy` key while the inversed side declares the `mappedBy` key |

::::: tabs card

:::: tab One-to-One

One-to-One relationships are useful when one entry can be linked to only one other entry.

They can be unidirectional or bidirectional. In unidirectional relationships, only one of the models can be queried with its linked item.

::: details Unidirectional use case example:

  - A blog article belongs to a category.
  - Querying an article can retrieve its category,
  - but querying a category won't retrieve the owned article.

  ```js
  // ./src/api/[api-name]/content-types/article/schema.json

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
  - and querying a category also retrieves its owned article.

  ```js
  // ./src/api/[api-name]/content-types/article/schema.json

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


  // ./src/api/[api-name]/content-types/category/schema.json

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

- an entry from a content-type A is linked to many entries of another content-type B,
- while an entry from content-type B is linked to only one entry of content-type A.

One-to-many relationships are always bidirectional, and are usually defined with the corresponding Many-to-One relationship:

::: details Example:
A person can own many plants, but a plant is owned by only one person.

```js
// ./src/api/[api-name]/content-types/plant/schema.json

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

// ./src/api/person/models/schema.json

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
  // ./src/api/[api-name]/content-types/book/schema.json

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
  // ./src/api/[api-name]/content-types/article/schema.json

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


  // ./src/api/[api-name]/content-types/category/schema.json

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

- an entry from content-type A is linked to many entries of content-type B,
- and an entry from content-type B is also linked to many entries from content-type A.

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
  // ./src/api/[api-name]/content-types/article/schema.json

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


  // ./src/api/[api-name]/content-types/tag/schema.json

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

**Path —** `./src/api/category/models/Category.settings.json`.

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

Component fields create a relation between a content-type and a component structure. Components are explicitly defined in the [attributes](#model-attributes) of a model with `type: 'component'` and accept the following additional parameters:

| Parameter    | Type    | Description                                                                              |
| ------------ | ------- | ---------------------------------------------------------------------------------------- |
| `repeatable` | Boolean | Could be `true` or `false` depending on whether the component is repeatable or not       |
| `component`  | String  | Define the corresponding component, following this format:<br/>`<category>.<componentName>`  |

```json
// ./src/api/[apiName]/restaurant/content-types/schema.json

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


#### Dynamic zones

Dynamic zones create a flexible space in which to compose content, based on a mixed list of [components](#components-2).

Dynamic zones are explicitly defined in the [attributes](#model-attributes)  of a model with `type: 'dynamiczone'`. They also accepts a `components` array, where each component should be named following this format: `<category>.<componentName>`.

```json
// ./src/api/[api-name]/content-types/article/schema.json

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

The `options` key is used to define specific behaviors and accepts the following parameter:

| Parameter           | Type             | Description                                                                                                                                                                                                                                                                                                        |
|---------------------|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `privateAttributes` | Array of strings | Allows treating a set of attributes as private, even if they're not actually defined as attributes in the model. It could be used to remove them from API responses timestamps. <br><br> The `privateAttributes` defined in the model are merged with the `privateAttributes` defined in the global Strapi configuration. |
| `draftAndPublish`   | Boolean          | Enables the draft and publish feature. <br><br> Default value: `true` (`false` if the content-type is created from the interactive CLI).                                                                                                                                                                                    |

```json
// ./src/api/[api-name]/content-types/restaurant/schema.json

{
  "options": {
    "privateAttributes": ["id", "created_at"],
    "draftAndPublish": true
  }
}
```

## Lifecycle hooks

Lifecycle hooks are functions that get triggered when Strapi queries are called. They are triggered automatically when managing content through the administration panel or when developing custom code using `queries`·

Lifecycle hooks can be customized declaratively or programmatically.

:::caution
Lifecycles hooks are not triggered when using directly the [knex](https://knexjs.org/) library instead of Strapi functions.
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
| `action` | String            | Lifecycle event that has been triggered (see [list](#available-lifecycle-events))                                                                                |
| `model`  | Object            | Model object                                                                                                                                                       |
| `params` | Object            | Accepts the following parameters:<ul><li>`data`</li><li>`select`</li><li>`where`</li><li>`orderBy`</li><li>`limit`</li><li>`offset`</li><li>`populate`</li></ul> |
| `result` | Object            | _Optional, only available with `afterXXX` events_<br><br>Contains the result of the action.                                                                      |
| `state`  | Object            | Query state, can be used to share state between `beforeXXX` and `afterXXX` events of a query.                                                               |
<!-- TODO: `state` has not been implemented yet, ask for more info once done -->

### Declarative and programmatic usage

To configure a content-type lifecycle hook, create a `lifecycles.js` file in the `./api/[api-name]/content-types/[content-type-name]/` folder.

Each event listener is called sequentially. They can be synchronous or asynchronous.

<code-group>
<code-block title=JAVASCRIPT>

```js
// ./src/api/[api-name]/content-types/[api-name]/lifecycles.js

module.exports = {
  beforeCreate(event) {
    const { data, where, select, populate } = event.params;

    // let's do a 20% discount everytime
    event.params.data.price = event.params.data.price * 0.8;
  },

  afterCreate(event) {
    const { result, params } = event;

    // do something to the result;
  },
};
```



</code-block>

<code-block title=TYPESCRIPT>

```js
// ./src/api/[api-name]/content-types/[api-name]/lifecycles.ts

export default {
  beforeCreate(event) {
    const { data, where, select, populate } = event.params;

    // let's do a 20% discount everytime
    event.params.data.price = event.params.data.price * 0.8;
  },

  afterCreate(event) {
    const { result, params } = event;

    // do something to the result;
  },
};
```

</code-block>
</code-group>

Using the database layer API, it's also possible to register a subscriber and listen to events programmatically:

```js
// ./src/api/[api-name]/content-types/[api-name]/lifecycles.js

// registering a subscriber
strapi.db.lifecycles.subscribe({
  models: [], // optional;

  beforeCreate(event) {
    const { data, where, select, populate } = event.params;

    event.state = 'doStuffAfterWards';
  },

  afterCreate(event) {
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
