---
title: Using Populate with the Document Service API
description: Use Strapi's Document Service API to populate or select certain fields.
sidebarDepth: 3
displayed_sidebar: devDocsSidebar
---

# Document Service API: Populating fields

By default Strapi will not populate any type of fields. The [Document Service API](/dev-docs/api/document-service) offers the ability to populate results.

:::caution
If the Users & Permissions plugin is installed, the `find` permission must be enabled for the content-types that are being populated. If a role doesn't have access to a content-type it will not be populated.
:::

## Relations

Queries can accept a `populate` parameter to explicitly define which fields to populate, with the following syntax option examples.

### Populate 1 level for all relations

To populate one-level deep for all relations, use the `*` wildcard in combination with the `populate` parameter:

<ApiCall noSideBySide>
<Request title="Example request">

```js

```

</Request>

<Response title="Example response">

```json
{
  // …
}
```

</Response>
</ApiCall>

### Populate 1 level

To populate specific relations one-level deep…

<ApiCall noSideBySide>
<Request title="Example request">

```js

```

</Request>

<Response title="Example response">

```json
{
  // ...
}
```

</Response>
</ApiCall>

### Populate 2 levels

To populate specific relations, 2 levels deep… 

<ApiCall noSideBySide>
<Request title="Example request">

```js

```

</Request>

<Response title="Example response">

```json
{
  // ...
}
```

</Response>
</ApiCall>

## Media fields

To populate media fields…

<ApiCall noSideBySide>
<Request title="Example request">

```js

```

</Request>

<Response title="Example response">

```json
{
  // …
}
```

</Response>
</ApiCall>

## Components & Dynamic Zones

To populate components…

<ApiCall noSideBySide>
<Request title="Example request">

```js

```

</Request>

<Response title="Example response">

```json
{
  // ...
}
```

</Response>
</ApiCall>

To populate dynamic zones…

<ApiCall noSideBySide>
<Request title="Example request">

```js

```

</Request>

<Response title="Example response">

```json
{
  // ...
}
```

</Response>
</ApiCall>

## Populating the `createdBy` and `updatedBy` fields

To populate the `createdBy` and `updatedBy` fields, …

<ApiCall noSideBySide>
<Request title="Example request">

```js

```

</Request>

<Response title="Example response">

```json
{
  // ...
}
```

</Response>
</ApiCall>

## Populating with `create()`

To populate while creating documents

<ApiCall noSideBySide>
<Request title="Example request">

```js

```

</Request>

<Response title="Example response">

```json
{
  // ...
}
```

</Response>
</ApiCall>

## Populating with `update()`

To populate while updating documents…

<ApiCall noSideBySide>
<Request title="Example request">

```js

```

</Request>

<Response title="Example response">

```json
{
  // ...
}
```

</Response>
</ApiCall>

## Populating with `publish()`

To populate while publishing documents…

<ApiCall noSideBySide>
<Request title="Example request">

```js

```

</Request>

<Response title="Example response">

```json
{
  // ...
}
```

</Response>
</ApiCall>

## Populating with `unpublish()`

To populate while unpublishing documents…

<ApiCall noSideBySide>
<Request title="Example request">

```js

```

</Request>

<Response title="Example response">

```json
{
  // ...
}
```

</Response>
</ApiCall>

## Populating with `discardDraft()`

To populate while discarding draft versions of documents…

<ApiCall noSideBySide>
<Request title="Example request">

```js

```

</Request>

<Response title="Example response">

```json
{
  // ...
}
```

</Response>
</ApiCall>
