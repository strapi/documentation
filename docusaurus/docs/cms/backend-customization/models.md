---
title: Models
description: Strapi models (i.e. content-types, components, and dynamic zones) define a representation of the content structure.
toc_max_heading_level: 4
tags:
- admin panel
- backend customization
- backend server
- content-type
- Content-type Builder
- models
- model schema
- lifecycle hooks
- REST API 
---

# Models

As Strapi is a headless Content Management System (CMS), creating a content structure for the content is one of the most important aspects of using the software. Models define a representation of the content structure.

There are 2 different types of models in Strapi:

- content-types, which can be collection types or single types, depending on how many entries they manage,
- and components that are content structures re-usable in multiple content-types.

If you are just starting out, it is convenient to generate some models with the [Content-type Builder](/cms/features/content-type-builder) directly in the admin panel. The user interface takes over a lot of validation tasks and showcases all the options available to create the content's content structure. The generated model mappings can then be reviewed at the code level using this documentation.

## Model creation

Content-types and components models are created and stored differently.

### Content-types

Content-types in Strapi can be created:

- with the [Content-type Builder in the admin panel](/cms/features/content-type-builder),
- or with [Strapi's interactive CLI `strapi generate`](/cms/cli#strapi-generate) command.

The content-types use the following files:

- `schema.json` for the model's [schema](#model-schema) definition. (generated automatically, when creating content-type with either method)
- `lifecycles.js` for [lifecycle hooks](#lifecycle-hooks). This file must be created manually.

These models files are stored in `./src/api/[api-name]/content-types/[content-type-name]/`, and any JavaScript or JSON file found in these folders will be loaded as a content-type's model (see [project structure](/cms/project-structure)).

:::note
In [TypeScript](/cms/typescript.md)-enabled projects, schema typings can be generated using the `ts:generate-types` command.
:::

### Components {#components-creation}

Component models can't be created with CLI tools. Use the [Content-type Builder](/cms/features/content-type-builder) or create them manually.

Components models are stored in the `./src/components` folder. Every component has to be inside a subfolder, named after the category the component belongs to (see [project structure](/cms/project-structure)).

## Model schema

The `schema.json` file of a model consists of:

- [settings](#model-settings), such as the kind of content-type the model represents or the table name in which the data should be stored,
- [information](#model-information), mostly used to display the model in the admin panel and access it through the REST and GraphQL APIs,
- [attributes](#model-attributes), which describe the content structure of the model,
- and [options](#model-options) used to defined specific behaviors on the model.

### Model settings

General settings for the model can be configured with the following parameters:

| Parameter                                          | Type   | Description                                                                                                            |
| -------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------- |
| `collectionName`                                  | String | Database table name in which the data should be stored                                                    |
| `kind`<br /><br />_Optional,<br/>only for content-types_ | String | Defines if the content-type is:<ul><li>a collection type (`collectionType`)</li><li>or a single type (`singleType`)</li></ul> |

```json
// ./src/api/[api-name]/content-types/restaurant/schema.json

{
  "kind": "collectionType",
  "collectionName": "Restaurants_v1",
}
```

### Model information

The `info` key in the model's schema describes information used to display the model in the admin panel and access it through the Content API. It includes the following parameters:

<!-- ? with the new design system, do we still use FontAwesome?  -->

| Parameter            | Type   | Description                                                                                                                                 |
| -------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `displayName`  | String | Default name to use in the admin panel                                                                                                      |
| `singularName` | String | Singular form of the content-type name.<br />Used to generate the API routes and databases/tables collection.<br /><br />Should be kebab-case. |
| `pluralName`   | String | Plural form of the content-type name.<br />Used to generate the API routes and databases/tables collection.<br /><br />Should be kebab-case.    |
| `description`  | String | Description of the model                                                                                                                   |

```json title="./src/api/[api-name]/content-types/restaurant/schema.json"

  "info": {
    "displayName": "Restaurant",
    "singularName": "restaurant",
    "pluralName": "restaurants",
    "description": ""
  },
```

### Model attributes

The content structure of a model consists of a list of attributes. Each attribute has a `type` parameter, which describes its nature and defines the attribute as a simple piece of data or a more complex structure used by Strapi.

Many types of attributes are available:

- scalar types (e.g. strings, dates, numbers, booleans, etc.),
- Strapi-specific types, such as:
  - `media` for files uploaded through the [Media library](/cms/features/content-type-builder#media)
  - `relation` to describe a [relation](#relations) between content-types
  - `customField` to describe [custom fields](#custom-fields) and their specific keys
  - `component` to define a [component](#components-json) (i.e. a content structure usable in multiple content-types)
  - `dynamiczone` to define a [dynamic zone](#dynamic-zones) (i.e. a flexible space based on a list of components)
  - and the `locale` and `localizations` types, only used by the [Internationalization (i18n) plugin](/cms/features/internationalization)

The `type` parameter of an attribute should be one of the following values:

| Type categories | Available types |
|------|-------|
| String types | <ul><li>`string`</li> <li>`text`</li> <li>`richtext`</li><li>`enumeration`</li> <li>`email`</li><li>`password`</li><li>[`uid`](#uid-type)</li></ul> |
| Date types | <ul><li>`date`</li> <li>`time`</li> <li>`datetime`</li> <li>`timestamp`</li></ul> |
| Number types | <ul><li>`integer`</li><li>`biginteger`</li><li>`float`</li> <li>`decimal`</li></ul> |
| Other generic types |<ul><li>`boolean`</li><li>`json`</li></ul> |
| Special types unique to Strapi |<ul><li>`media`</li><li>[`relation`](#relations)</li><li>[`customField`](#custom-fields)</li><li>[`component`](#components-json)</li><li>[`dynamiczone`](#dynamic-zones)</li></ul> |
| Internationalization (i18n)-related types<br /><br />_Can only be used if the [i18n](/cms/features/internationalization) is enabled on the content-type_|<ul><li>`locale`</li><li>`localizations`</li></ul> |

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

```json title="./src/api/[api-name]/content-types/restaurant/schema.json"

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

```json title="./src/api/[api-name]/content-types/restaurant/schema.json"

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
- `options` (string): If used, the UID is generated based on a set of options passed to <ExternalLink to="https://github.com/sindresorhus/slugify" text="the underlying `uid` generator"/>. The resulting `uid` must match the following regular expression pattern: `/^[A-Za-z0-9-_.~]*$`.

#### Relations

Relations link content-types together. Relations are explicitly defined in the [attributes](#model-attributes)  of a model with `type: 'relation'`  and accept the following additional parameters:

| Parameter                         | Description                                                                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `relation`                  | The type of relation among these values:<ul><li>`oneToOne`</li><li>`oneToMany`</li><li>`manyToOne`</li><li>`manyToMany`</li></ul>                   |
| `target`                    | Accepts a string value as the name of the target content-type                                                                                   |
| `mappedBy` and `inversedBy`<br /><br />_Optional_ | In bidirectional relations, the owning side declares the `inversedBy` key while the inversed side declares the `mappedBy` key |

<Tabs>

<TabItem value="one-to-one" label="One-to-one">

One-to-One relationships are useful when one entry can be linked to only one other entry.

They can be unidirectional or bidirectional. In unidirectional relationships, only one of the models can be queried with its linked item.

<details>
<summary>Unidirectional use case example:</summary>

  - A blog article belongs to a category.
  - Querying an article can retrieve its category,
  - but querying a category won't retrieve the owned article.

  ```json title="./src/api/[api-name]/content-types/article/schema.json"

    // …
    attributes: {
      category: {
        type: 'relation',
        relation: 'oneToOne',
        target: 'category',
      },
    },
    // …
  ```

</details>

<details>
<summary>Bidirectional use case example:</summary>

  - A blog article belongs to a category.
  - Querying an article can retrieve its category,
  - and querying a category also retrieves its owned article.

  ```json title="./src/api/[api-name]/content-types/article/schema.json"

    // …
    attributes: {
      category: {
        type: 'relation',
        relation: 'oneToOne',
        target: 'category',
        inversedBy: 'article',
      },
    },
    // …

  ```

  ```json title="./src/api/[api-name]/content-types/category/schema.json"

    // …
    attributes: {
      article: {
        type: 'relation',
        relation: 'oneToOne',
        target: 'article',
        mappedBy: 'category',
      },
    },
    // …

  ```

</details>

</TabItem>

<TabItem value="one-to-many" label="One-to-Many">

One-to-Many relationships are useful when:

- an entry from a content-type A is linked to many entries of another content-type B,
- while an entry from content-type B is linked to only one entry of content-type A.

One-to-many relationships are always bidirectional, and are usually defined with the corresponding Many-to-One relationship:

<details>
<summary>Example:</summary>
A person can own many plants, but a plant is owned by only one person.

```json title="./src/api/[api-name]/content-types/plant/schema.json"

  // …
  attributes: {
    owner: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::person.person',
      inversedBy: 'plants',
    },
  },
  // …

```

```json title="./src/api/person/models/schema.json"

  // …
  attributes: {
    plants: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::plant.plant',
      mappedBy: 'owner',
    },
  },
  // …
```

</details>

</TabItem>

<TabItem value="many-to-one" label="Many-to-One">

Many-to-One relationships are useful to link many entries to one entry.

They can be unidirectional or bidirectional. In unidirectional relationships, only one of the models can be queried with its linked item.

<details>
<summary>Unidirectional use case example:</summary>

  A book can be written by many authors.

  ```json title="./src/api/[api-name]/content-types/book/schema.json"

    // …
    attributes: {
      author: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'author',
      },
    },
    // …

  ```

</details>

<details>
<summary>Bidirectional use case example:</summary>

  An article belongs to only one category but a category has many articles.

  ```json title="./src/api/[api-name]/content-types/article/schema.json"

    // …
    attributes: {
      author: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'category',
        inversedBy: 'article',
      },
    },
    // …
  ```

  ```json title="./src/api/[api-name]/content-types/category/schema.json"

    // …
    attributes: {
      books: {
        type: 'relation',
        relation: 'oneToMany',
        target: 'article',
        mappedBy: 'category',
      },
    },
    // …
  ```

</details>

</TabItem>

<TabItem value="many-to-many" label="Many-to-Many">

Many-to-Many relationships are useful when:

- an entry from content-type A is linked to many entries of content-type B,
- and an entry from content-type B is also linked to many entries from content-type A.

Many-to-many relationships can be unidirectional or bidirectional. In unidirectional relationships, only one of the models can be queried with its linked item.

<details>
<summary>Unidirectional use case example:</summary>

  ```json
    // …
    attributes: {
      categories: {
        type: 'relation',
        relation: 'manyToMany',
        target: 'category',
      },
    },
    // …
  ```

</details>

<details>
<summary>Bidirectional use case example:</summary>

An article can have many tags and a tag can be assigned to many articles.

  ```json title="/src/api/[api-name]/content-types/article/schema.json"

    // …
    attributes: {
      tags: {
        type: 'relation',
        relation: 'manyToMany',
        target: 'tag',
        inversedBy: 'articles',
      },
    },
    // …
  ```

  ```json title="./src/api/[api-name]/content-types/tag/schema.json"

    // …
    attributes: {
      articles: {
        type: 'relation',
        relation: 'manyToMany',
        target: 'article',
        mappedBy: 'tag',
      },
    },
    // …
  ```

</details>

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

</TabItem>

</Tabs>

#### Custom fields

[Custom fields](/cms/features/custom-fields) extend Strapi’s capabilities by adding new types of fields to content-types. Custom fields are explicitly defined in the [attributes](#model-attributes) of a model with `type: customField`.

Custom fields' attributes also show the following specificities:

- a `customField` attribute whose value acts as a unique identifier to indicate which registered custom field should be used. Its value follows:
   - either the `plugin::plugin-name.field-name` format if a plugin created the custom field 
   - or the `global::field-name` format for a custom field specific to the current Strapi application
- and additional parameters depending on what has been defined when registering the custom field (see [custom fields documentation](/cms/features/custom-fields)).

```json title="./src/api/[apiName]/[content-type-name]/content-types/schema.json"

{
  // …
  "attributes": {
    "attributeName": { // attributeName would be replaced by the actual attribute name
      "type": "customField",
      "customField": "plugin::color-picker.color",
      "options": {
        "format": "hex"
      }
    }
  }
  // …
}
```

#### Components {#components-json}

Component fields create a relation between a content-type and a component structure. Components are explicitly defined in the [attributes](#model-attributes) of a model with `type: 'component'` and accept the following additional parameters:

| Parameter    | Type    | Description                                                                              |
| ------------ | ------- | ---------------------------------------------------------------------------------------- |
| `repeatable` | Boolean | Could be `true` or `false` depending on whether the component is repeatable or not       |
| `component`  | String  | Define the corresponding component, following this format:<br/>`<category>.<componentName>`  |

```json title="./src/api/[apiName]/restaurant/content-types/schema.json"

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

Dynamic zones create a flexible space in which to compose content, based on a mixed list of [components](#components-json).

Dynamic zones are explicitly defined in the [attributes](#model-attributes)  of a model with `type: 'dynamiczone'`. They also accept a `components` array, where each component should be named following this format: `<category>.<componentName>`.

```json title="./src/api/[api-name]/content-types/article/schema.json"

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
| `privateAttributes` | Array of strings | Allows treating a set of attributes as private, even if they're not actually defined as attributes in the model. It could be used to remove them from API responses timestamps. <br /><br /> The `privateAttributes` defined in the model are merged with the `privateAttributes` defined in the global Strapi configuration. |
| `draftAndPublish`   | Boolean          | Enables the draft and publish feature. <br /><br /> Default value: `true` (`false` if the content-type is created from the interactive CLI).                                                                                                                                                                                    |
| `populateCreatorFields` | Boolean | Populates `createdBy` and `updatedBy` fields in responses returned by the REST API (see [guide](/cms/api/rest/guides/populate-creator-fields) for more details).<br/><br/>Default value: `false`. |

```json title="./src/api/[api-name]/content-types/restaurant/schema.json"

{
  "options": {
    "privateAttributes": ["id", "createdAt"],
    "draftAndPublish": true
  }
}
```

### Plugin options

`pluginOptions` is an optional object allowing plugins to store configuration for a model or a specific attribute.

| Key                       | Value                         | Description                                            |
|---------------------------|-------------------------------|--------------------------------------------------------|
| `i18n`                    | `localized: true`             | Enables localization.                                  |
| `content-manager`         | `visible: false`              | Hides from Content Manager in the admin panel.         |
| `content-type-builder`    | `visible: false`              | Hides from Content-type Builder in the admin panel.    |

```json title="./src/api/[api-name]/content-types/[content-type-name]/schema.json"

{
  "attributes": {
    "name": {
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      },
      "type": "string",
      "required": true
    },
    "slug": {
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      },
      "type": "uid",
      "targetField": "name",
      "required": true
    }
    // …additional attributes
  }
}

```

## Lifecycle hooks

Lifecycle hooks are functions that get triggered when Strapi queries are called. They are triggered automatically when managing content through the administration panel or when developing custom code using `queries`·

Lifecycle hooks can be customized declaratively or programmatically.

:::caution
Lifecycles hooks are not triggered when using directly the <ExternalLink to="https://knexjs.org/" text="knex"/> library instead of Strapi functions.
:::

:::strapi Document Service API: lifecycles and middlewares
The Document Service API triggers various database lifecycle hooks based on which method is called. For a complete reference, see [Document Service API: Lifecycle hooks](/cms/migration/v4-to-v5/breaking-changes/lifecycle-hooks-document-service#table). Bulk actions lifecycles (`createMany`, `updateMany`, `deleteMany`) will never be triggered by a Document Service API method. [Document Service middlewares](/cms/api/document-service/middlewares) can be implemented too.
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
| `model`  | Array of strings (uid)            | An array of uids of the content-types whose events will be listened to.<br />If this argument is not supplied, events are listened on all content-types. |
| `params` | Object            | Accepts the following parameters:<ul><li>`data`</li><li>`select`</li><li>`where`</li><li>`orderBy`</li><li>`limit`</li><li>`offset`</li><li>`populate`</li></ul> |
| `result` | Object            | _Optional, only available with `afterXXX` events_<br /><br />Contains the result of the action.                                                                      |
| `state`  | Object            | Query state, can be used to share state between `beforeXXX` and `afterXXX` events of a query.                                                               |
<!-- TODO: `state` has not been implemented yet, ask for more info once done -->

### Declarative and programmatic usage

To configure a content-type lifecycle hook, create a `lifecycles.js` file in the `./src/api/[api-name]/content-types/[content-type-name]/` folder.

Each event listener is called sequentially. They can be synchronous or asynchronous.

<Tabs groupdId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="./src/api/[api-name]/content-types/[content-type-name]/lifecycles.js"

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

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./src/api/[api-name]/content-types/[content-type-name]/lifecycles.ts"

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

</TabItem>
</Tabs>

Using the database layer API, it's also possible to register a subscriber and listen to events programmatically:

```js title="./src/index.js"
module.exports = {
  async bootstrap({ strapi }) {
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
  }
}
```
