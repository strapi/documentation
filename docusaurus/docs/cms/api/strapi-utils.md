---
title: Utilities
description: The @strapi/utils package provides shared utility functions for error handling, environment variables, data validation, hooks, string manipulation, and more.
displayed_sidebar: cmsSidebar
tags:
  - api
  - strapi-utils
  - error-handling
  - env
  - hooks
  - validation
  - primitives
---

# Utilities

<Tldr>
The `@strapi/utils` package provides shared helper functions used across Strapi's core and available for use in custom code. It includes error classes, environment variable helpers, hook factories, type parsing, string and file utilities, and async helpers.
</Tldr>

The `@strapi/utils` package (`import { ... } from '@strapi/utils'`) contains utility functions that Strapi uses internally but that you can also use in your own [controllers](/cms/backend-customization/controllers), [services](/cms/backend-customization/services), [policies](/cms/backend-customization/policies), [middlewares](/cms/backend-customization/middlewares), and [lifecycle hooks](/cms/backend-customization/models#lifecycle-hooks).

:::note
The [error classes](#errors) section of this page expands on the error handling documentation found in the dedicated [Error handling](/cms/error-handling) page.
:::

## errors

Custom error classes that extend the Node.js `Error` class. All errors share a common structure:

| Property | Type | Description |
| --- | --- | --- |
| `name` | `string` | Error class name (e.g., `'ApplicationError'`, `'ValidationError'`) |
| `message` | `string` | Human-readable error message |
| `details` | `object` | Additional error context |

Import errors from the package:

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js
const { errors } = require('@strapi/utils');
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts
import { errors } from '@strapi/utils';
```

</TabItem>

</Tabs>

The following error classes are available:

| Error class | Default message | Default status | Details default |
| --- | --- | --- | --- |
| `ApplicationError` | `'An application error occurred'` | N/A | `{}` |
| `ValidationError` | (required) | N/A | `{}` |
| `YupValidationError` | `'Validation'` | N/A | `{ errors: [] }` |
| `PaginationError` | `'Invalid pagination'` | N/A | `{}` |
| `NotFoundError` | `'Entity not found'` | N/A | `{}` |
| `ForbiddenError` | `'Forbidden access'` | N/A | `{}` |
| `UnauthorizedError` | `'Unauthorized'` | N/A | `{}` |
| `RateLimitError` | `'Too many requests, please try again later.'` | N/A | `{}` |
| `PayloadTooLargeError` | `'Entity too large'` | N/A | `{}` |
| `PolicyError` | `'Policy Failed'` | N/A | `{}` |
| `NotImplementedError` | `'This feature is not implemented yet'` | N/A | `{}` |

`PolicyError` extends `ForbiddenError`. All other error classes extend `ApplicationError`.

### Usage example

```js
const { errors } = require('@strapi/utils');

// In a service or lifecycle hook
throw new errors.ApplicationError('Something went wrong', { foo: 'bar' });

// In a policy
throw new errors.PolicyError('Access denied', { policy: 'is-owner' });
```

:::tip
Use `ApplicationError` when throwing errors in model lifecycle hooks so that meaningful messages display in the admin panel. See the [Error handling](/cms/error-handling) page for more examples.
:::

## env

A helper function to read environment variables with type-safe parsing. The `env` function returns the raw string value, while its methods parse the value to a specific type.

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js
const { env } = require('@strapi/utils');
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts
import { env } from '@strapi/utils';
```

</TabItem>

</Tabs>

### Available methods

| Method | Return type | Description |
| --- | --- | --- |
| `env(key)` | `string \| undefined` | Return the raw value |
| `env(key, default)` | `string` | Return the raw value or the default |
| `env.int(key, default?)` | `number \| undefined` | Parse as integer (`parseInt`) |
| `env.float(key, default?)` | `number \| undefined` | Parse as float (`parseFloat`) |
| `env.bool(key, default?)` | `boolean \| undefined` | `'true'` returns `true`, anything else returns `false` |
| `env.json(key, default?)` | `object \| undefined` | Parse as JSON; throws on invalid JSON |
| `env.array(key, default?)` | `string[] \| undefined` | Split by comma, trim values, strip surrounding `[]` and quotes |
| `env.date(key, default?)` | `Date \| undefined` | Parse with `new Date()` |
| `env.oneOf(key, expectedValues, default)` | `string` | Return value if it matches one of `expectedValues`; throws otherwise |

### Usage example

```js title="path: /config/server.js"
const { env } = require('@strapi/utils');

module.exports = {
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
};
```

## parseType

Cast a value to a specific Strapi field type.

```js
const { parseType } = require('@strapi/utils');
```

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `type` | `string` | Target type: `'boolean'`, `'integer'`, `'biginteger'`, `'float'`, `'decimal'`, `'time'`, `'date'`, `'timestamp'`, or `'datetime'` |
| `value` | `unknown` | The value to parse |
| `forceCast` | `boolean` | Force conversion for booleans. Default: `false` |

### Return values by type

| Type | Return type | Format |
| --- | --- | --- |
| `boolean` | `boolean` | Accepts `'true'`, `'t'`, `'1'`, `1` as `true` |
| `integer`, `biginteger`, `float`, `decimal` | `number` | Numeric conversion |
| `time` | `string` | `HH:mm:ss.SSS` |
| `date` | `string` | `yyyy-MM-dd` |
| `timestamp`, `datetime` | `Date` | Date object |

### Usage example

```js
parseType({ type: 'boolean', value: 'true' }); // true
parseType({ type: 'integer', value: '42' });    // 42
parseType({ type: 'date', value: '2024-01-15T10:30:00Z' }); // '2024-01-15'
```

## hooks

Factory functions to create hook registries. Hooks let you register handler functions and execute them in different patterns.

```js
const { hooks } = require('@strapi/utils');
```

Each hook exposes 3 methods:

| Method | Description |
| --- | --- |
| `register(handler)` | Add a handler function to the hook |
| `delete(handler)` | Remove a previously registered handler |
| `getHandlers()` | Return the list of registered handlers |

### Available hook factories

| Factory | Execution pattern |
| --- | --- |
| `hooks.createAsyncSeriesHook()` | Execute handlers sequentially with the same context |
| `hooks.createAsyncSeriesWaterfallHook()` | Execute handlers sequentially, passing each return value to the next handler |
| `hooks.createAsyncParallelHook()` | Execute all handlers concurrently |
| `hooks.createAsyncBailHook()` | Execute handlers sequentially, stop at the first handler that returns a non-`undefined` value |

### Usage example

```js
const { hooks } = require('@strapi/utils');

const myHook = hooks.createAsyncSeriesHook();

myHook.register(async (context) => {
  console.log('First handler', context);
});

myHook.register(async (context) => {
  console.log('Second handler', context);
});

// Execute all handlers in order
await myHook.call({ data: 'example' });
```

## policy

Helpers to create and manage [policies](/cms/backend-customization/policies).

```js
const { policy } = require('@strapi/utils');
```

### createPolicy

Create a policy with an optional configuration validator:

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | `string` | Yes | Policy name |
| `handler` | `function` | Yes | Policy handler function |
| `validator` | `function` | No | Validate the policy configuration; throws on invalid config |

```js
const myPolicy = policy.createPolicy({
  name: 'is-owner',
  validator: (config) => {
    if (!config.field) throw new Error('Missing field');
  },
  handler: (ctx, config, { strapi }) => {
    // policy logic
    return true;
  },
});
```

### createPolicyContext

Create a typed context object for use within a policy:

```js
const policyCtx = policy.createPolicyContext('admin', ctx);

policyCtx.is('admin'); // true
policyCtx.type;        // 'admin'
```

## sanitize

The `sanitize` namespace provides functions to clean input and output data based on content-type schemas. Use `sanitize` to remove disallowed, private, or restricted fields before processing or returning data.

```js
const { sanitize } = require('@strapi/utils');
```

### createAPISanitizers

Create a set of sanitizer functions bound to a Strapi instance:

```js
const sanitizers = sanitize.createAPISanitizers({ strapi, auth });
```

The returned object provides:

| Method | Description |
| --- | --- |
| `sanitizers.input(data, schema, options?)` | Sanitize request body data |
| `sanitizers.output(data, schema, options?)` | Sanitize response data |
| `sanitizers.query(query, schema, options?)` | Sanitize query parameters |
| `sanitizers.filters(filters, schema, options?)` | Sanitize filter expressions |
| `sanitizers.sort(sort, schema, options?)` | Sanitize sort parameters |
| `sanitizers.fields(fields, schema, options?)` | Sanitize field selections |
| `sanitizers.populate(populate, schema, options?)` | Sanitize populate directives |

:::tip
In controllers, you can use the built-in `sanitizeQuery` and `sanitizeOutput` methods instead of calling `sanitize.createAPISanitizers` directly. See [Controllers](/cms/backend-customization/controllers) for details.
:::

## validate

The `validate` namespace provides functions to check input and query data against content-type schemas. Use `validate` to reject requests that reference unknown, private, or restricted fields.

```js
const { validate } = require('@strapi/utils');
```

### createAPIValidators

Create a set of validator functions bound to a Strapi instance:

```js
const validators = validate.createAPIValidators({ strapi, auth });
```

The returned object provides:

| Method | Description |
| --- | --- |
| `validators.input(data, schema, options?)` | Validate request body data |
| `validators.query(query, schema, options?)` | Validate query parameters |
| `validators.filters(filters, schema, options?)` | Validate filter expressions |
| `validators.sort(sort, schema, options?)` | Validate sort parameters |
| `validators.fields(fields, schema, options?)` | Validate field selections |
| `validators.populate(populate, schema, options?)` | Validate populate directives |

## contentTypes

The `contentTypes` namespace exposes constants and helper functions for working with Strapi content-type schemas.

```js
const { contentTypes } = require('@strapi/utils');
```

### Constants

| Constant | Value | Description |
| --- | --- | --- |
| `ID_ATTRIBUTE` | `'id'` | Primary key field name |
| `DOC_ID_ATTRIBUTE` | `'documentId'` | Document identifier field name |
| `PUBLISHED_AT_ATTRIBUTE` | `'publishedAt'` | Publication timestamp field name |
| `CREATED_BY_ATTRIBUTE` | `'createdBy'` | Creator reference field name |
| `UPDATED_BY_ATTRIBUTE` | `'updatedBy'` | Last editor reference field name |
| `CREATED_AT_ATTRIBUTE` | `'createdAt'` | Creation timestamp field name |
| `UPDATED_AT_ATTRIBUTE` | `'updatedAt'` | Update timestamp field name |
| `SINGLE_TYPE` | `'singleType'` | Single type kind identifier |
| `COLLECTION_TYPE` | `'collectionType'` | Collection type kind identifier |

### Attribute inspection functions

| Function | Description |
| --- | --- |
| `isRelationalAttribute(attribute)` | Check if the attribute is a relation |
| `isMediaAttribute(attribute)` | Check if the attribute is a media field |
| `isDynamicZoneAttribute(attribute)` | Check if the attribute is a dynamic zone |
| `isComponentAttribute(attribute)` | Check if the attribute is a component |
| `isMorphToRelationalAttribute(attribute)` | Check if the attribute is a morph-to relation |
| `isScalarAttribute(attribute)` | Check if the attribute is a scalar value |
| `isTypedAttribute(attribute, type)` | Check if the attribute has a specific type |

### Schema inspection functions

| Function | Description |
| --- | --- |
| `getTimestamps(schema)` | Return `createdAt` and `updatedAt` field names |
| `getCreatorFields(schema)` | Return `createdBy` and `updatedBy` field names |
| `getNonWritableAttributes(schema)` | Return field names that cannot be written to |
| `getWritableAttributes(schema)` | Return field names that can be written to |
| `isWritableAttribute(schema, attributeName)` | Check if a specific attribute is writable |
| `hasDraftAndPublish(schema)` | Check if the schema has draft and publish enabled |
| `getVisibleAttributes(schema)` | Return attributes that are not internal timestamps or creator fields |
| `getScalarAttributes(schema)` | Return attributes that are scalar values |
| `getPopulatableAttributes(schema)` | Return attributes that can be populated (relations, components, dynamic zones, media) |

## relations

The `relations` namespace provides helpers to inspect relation attributes.

```js
const { relations } = require('@strapi/utils');
```

| Function | Description |
| --- | --- |
| `getRelationalFields(contentType)` | Return all relation field names from a content type |
| `isOneToAny(attribute)` | Check for `oneToOne` or `oneToMany` relations |
| `isManyToAny(attribute)` | Check for `manyToMany` or `manyToOne` relations |
| `isAnyToOne(attribute)` | Check for `oneToOne` or `manyToOne` relations |
| `isAnyToMany(attribute)` | Check for `oneToMany` or `manyToMany` relations |
| `isPolymorphic(attribute)` | Check for `morphOne`, `morphMany`, `morphToOne`, or `morphToMany` relations |

## pagination

The `pagination` namespace provides helpers for handling pagination parameters.

```js
const { pagination } = require('@strapi/utils');
```

| Function | Description |
| --- | --- |
| `withDefaultPagination(params, options?)` | Apply default values and validate pagination parameters. Supports both `page`/`pageSize` and `start`/`limit` formats |
| `transformPagedPaginationInfo(params)` | Transform pagination data into `{ page, pageSize, pageCount, total }` format |
| `transformOffsetPaginationInfo(params)` | Transform pagination data into `{ start, limit, total }` format |

## primitives

The `primitives` namespace groups low-level data transformation helpers.

```js
const { primitives } = require('@strapi/utils');
```

### primitives.strings

| Function | Description |
| --- | --- |
| `nameToSlug(name, options?)` | Convert a name to a URL-friendly slug. Default separator: `'-'` |
| `nameToCollectionName(name)` | Convert a name to a snake_case collection name |
| `toRegressedEnumValue(value)` | Convert a value to `UPPER_SNAKE_CASE` for use as an enum key |
| `getCommonPath(...paths)` | Find the common path prefix from multiple file paths |
| `isCamelCase(value)` | Check if a string is in `camelCase` format |
| `isKebabCase(value)` | Check if a string is in `kebab-case` format |
| `toKebabCase(value)` | Convert a string to `kebab-case` |
| `startsWithANumber(value)` | Check if a string starts with a digit |
| `joinBy(separator, ...parts)` | Join strings with a separator, trimming duplicate separators at join points |
| `isEqual(a, b)` | Compare 2 values as strings |

### primitives.objects

| Function | Description |
| --- | --- |
| `keysDeep(obj)` | Return all nested keys in dot-notation (e.g., `['a.b', 'a.c']`) |

### primitives.arrays

| Function | Description |
| --- | --- |
| `includesString(arr, val)` | Check if an array includes a value when both are compared as strings |
| `castIncludes(arr, val, castFn)` | Check if an array includes a value after applying a cast function to both |

## async

The `async` namespace provides asynchronous utility functions.

```js
const { async } = require('@strapi/utils');
```

| Function | Description |
| --- | --- |
| `async.pipe(...fns)` | Compose functions: the first function runs with the original arguments, each subsequent function receives the previous return value. Returns a `Promise`. |
| `async.map(iterable)(mapper, options?)` | Curried parallel map using `p-map`. Set `concurrency` in options to control parallelism. |
| `async.reduce(array)(iteratee, initialValue?)` | Asynchronous reduce over an array. The iteratee receives `(accumulator, item, index)`. |

### Usage example

```js
const { async: asyncUtils } = require('@strapi/utils');

const result = await asyncUtils.pipe(
  fetchUser,
  enrichWithProfile,
  formatResponse
)(userId);
```

## file

The `file` namespace provides helpers for working with streams and file sizes.

```js
const { file } = require('@strapi/utils');
```

| Function | Return type | Description |
| --- | --- | --- |
| `streamToBuffer(stream)` | `Promise<Buffer>` | Convert a readable stream into a Buffer |
| `getStreamSize(stream)` | `Promise<number>` | Calculate the total size of a stream in bytes |
| `bytesToHumanReadable(bytes)` | `string` | Format bytes as a human-readable string (e.g., `'1.5 MB'`) |
| `bytesToKbytes(bytes)` | `number` | Convert bytes to kilobytes (rounded to 2 decimals) |
| `kbytesToBytes(kbytes)` | `number` | Convert kilobytes to bytes |
| `writableDiscardStream(options?)` | `Writable` | Create a writable stream that discards all data |

## providerFactory

Create a registry that stores and retrieves items by key, with lifecycle hooks.

```js
const { providerFactory } = require('@strapi/utils');
```

### Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `throwOnDuplicates` | `boolean` | `true` | Throw an error when registering a key that already exists |

### Provider methods

| Method | Return type | Description |
| --- | --- | --- |
| `register(key, item)` | `Promise<Provider>` | Register an item. Triggers `willRegister` and `didRegister` hooks. |
| `delete(key)` | `Promise<Provider>` | Remove an item. Triggers `willDelete` and `didDelete` hooks. |
| `get(key)` | `T \| undefined` | Retrieve an item by key |
| `values()` | `T[]` | Return all registered items |
| `keys()` | `string[]` | Return all registered keys |
| `has(key)` | `boolean` | Check if a key is registered |
| `size()` | `number` | Return the number of registered items |
| `clear()` | `Promise<Provider>` | Remove all items |

### Provider hooks

Each provider instance exposes a `hooks` object with 4 hook registries:

| Hook | Type | Trigger |
| --- | --- | --- |
| `hooks.willRegister` | Async series | Before an item is registered |
| `hooks.didRegister` | Async parallel | After an item is registered |
| `hooks.willDelete` | Async parallel | Before an item is deleted |
| `hooks.didDelete` | Async parallel | After an item is deleted |

### Usage example

```js
const { providerFactory } = require('@strapi/utils');

const registry = providerFactory();

registry.hooks.willRegister.register(async ({ key, value }) => {
  console.log(`About to register: ${key}`);
});

await registry.register('my-provider', { execute: () => {} });

registry.get('my-provider');  // { execute: [Function] }
registry.has('my-provider');  // true
registry.size();              // 1
```

## setCreatorFields

Set `createdBy` and `updatedBy` fields on an entity.

```js
const { setCreatorFields } = require('@strapi/utils');
```

### Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `user` | `{ id: string \| number }` | (required) | The user performing the action |
| `isEdition` | `boolean` | `false` | If `true`, only set `updatedBy`; if `false`, set both `createdBy` and `updatedBy` |

### Usage example

```js
const { setCreatorFields } = require('@strapi/utils');

const addCreator = setCreatorFields({ user: { id: 1 } });
const data = addCreator({ title: 'My Article' });
// { title: 'My Article', createdBy: 1, updatedBy: 1 }

const updateCreator = setCreatorFields({ user: { id: 2 }, isEdition: true });
const updated = updateCreator(data);
// { title: 'My Article', createdBy: 1, updatedBy: 2 }
```

## yup

The `yup` namespace re-exports the <ExternalLink to="https://github.com/jquense/yup" text="Yup validation library" /> with Strapi-specific extensions.

```js
const { yup } = require('@strapi/utils');
```

### Additional Yup methods

| Method | Schema type | Description |
| --- | --- | --- |
| `yup.strapiID()` | Custom | Validate a Strapi ID (string or non-negative integer) |
| `.notNil()` | Any | Ensure value is not `undefined` or `null` |
| `.notNull()` | Any | Ensure value is not `null` |
| `.isFunction()` | Mixed | Validate that the value is a function |
| `.isCamelCase()` | String | Validate `camelCase` format |
| `.isKebabCase()` | String | Validate `kebab-case` format |
| `.onlyContainsFunctions()` | Object | Validate that all values in the object are functions |
| `.uniqueProperty(property)` | Array | Validate that a specific property is unique across array items |

### Schema validation helpers

| Function | Description |
| --- | --- |
| `validateYupSchema(schema)` | Return an async validator function for a Yup schema |
| `validateYupSchemaSync(schema)` | Return a synchronous validator function for a Yup schema |

## zod

The `zod` namespace re-exports the <ExternalLink to="https://zod.dev" text="Zod validation library" /> for schema validation.

```js
const { zod } = require('@strapi/utils');
const { z } = zod;

const schema = z.object({
  name: z.string().min(1),
  age: z.number().positive(),
});
```

### validateZod

Create a validator function from a Zod schema:

```js
const { validateZod } = require('@strapi/utils');

const validate = validateZod(schema);
validate(data); // throws ValidationError on failure
```
