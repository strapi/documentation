---
title: Models - Strapi Developer Documentation
description: (…)
sidebarDepth: 3
---

<!-- TODO: update SEO -->

# Models

Models are a representation of the database's structure.

Models are available through the `strapi.models` and `strapi.api.**.models` global variables. Usable everywhere in the project, they contain the ORM model object that they refer to.

## Model creation

::: strapi Creating models with the Content-Types Builder
If you are just starting out, it is very convenient to generate some models with the Content-Types Builder directly in the admin interface. You can then review the generated model mappings on the code level. The UI takes over a lot of validation tasks and gives you a feeling for available features.
:::

**Content-Type** models can be created:

- with the [Content-Types Builder in the admin panel](/user-docs/latest/content-types-builder/introduction-to-content-types-builder.md),
- or with [Strapi's CLI `generate:model`](/developer-docs/latest/developer-resources/cli/CLI.html#strapi-generate-model) command.

Creating a Content-Type generates 2 files:

- `schema.json`: contains the list of attributes and settings in a JSON format that makes it easily editable,
- `lifecycles.js`: contains [lifecycle hooks](#lifecycle-hooks).

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

The `info` key in the model's schema states information about the model. This information is used in the admin interface, when showing the model. It includes the following keys:

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
| String types | <ul><li>`string`</li> <li>`text`</li> <li>`richtext`</li> <li>`enumeration`</li> <li>`email`</li> <li>`password`</li> <li>[`uid`](#uid-type)</li></ul> |
| Date types | <ul><li>`date`</li> <li>`time`</li> <li>`datetime`</li> <li>`timestamp`</li></ul> |
| Number types | <ul><li>`integer`</li> <li>`float`</li> <li>`decimal`</li> <li>`biginteger`</li></ul> |
| Other generic types |<ul><li>`json`</li> <li>`boolean`</li> <li>`array`</li> <li>`media`</li></ul> |
| [Internationalization](/developer-docs/latest/development/plugins/i18n.md)-related types |<ul><li>`locale`</li><li>`localizations`</li></ul> |
| Special types unique to Strapi |<ul><li>`relations` (see [relations documentation](#relations))</li><li>`component` (see [components documentation](#components))</li><li>`dynamiczone` (see [dynamic zone documentation](#dynamic-zone))</li></ul> |


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

The `uid` type is used to automatically generate unique ids (e.g., slugs for articles) based on 2 parameters:
<!-- TODO: check w/ Alex is options key for uid is still usable -->

- `targetField`(string) — The value is the name of an attribute that has `string` of the `text` type.
- `options` (string) — The value is a set of options passed to [the underlying `uid` generator](https://github.com/sindresorhus/slugify). A caveat is that the resulting `uid` must abide to the following RegEx `/^[A-Za-z0-9-_.~]*$`.

##### Relations

##### Components

#### Dynamic Zones

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

<!-- TODO: validate the type and description of every parameter -->

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

<!-- TODO: update code in TIP below and check if it works:
beforeCreate(data) → beforeCreate(event)
data.name → event.params.data.name -->

### Programmatic usage

Using the database layer API, it's possible to register a subscriber and listen to events programmatically:

```js
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
