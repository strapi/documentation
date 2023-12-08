---
title: Using Select with the Document Service API
description: Use Strapi's Document Service API to select the fields to return with your queries.
displayed_sidebar: devDocsSidebar
---

# Document Service API: Selecting fields

By default the [Document Service API](/dev-docs/api/document-service) returns all the fields of a document but does not populate any fields. This page describes how to use the `select` parameter to return only specific fields with the query results.

:::tip
You can also use the `populate` parameter to populate relations, media fields, components, or dynamic zones (see the [`populate` parameter](/dev-docs/api/document-service/populate) documentation).
:::

## Selecting fields with `findOne()` queries

To select fields to return while [finding a specific document](/dev-docs/api/document-service#findone) with the Document Service API:

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

## Selecting fields with `findFirst()` queries

To select fields to return while [finding the first document](/dev-docs/api/document-service#findfirst) matching the parameters…

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

## Selecting fields with `findMany()` queries

To select fields to return while [finding documents](/dev-docs/api/document-service#findmany)…

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

## Selecting fields with `create()` queries

To select fields to return while [creating documents](/dev-docs/api/document-service#create)…

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

## Selecting fields with `update()` queries

To select fields to return while [updating documents](/dev-docs/api/document-service#update)…

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

## Selecting fields with `delete()` queries

To select fields to return while [deleting documents](/dev-docs/api/document-service#delete)…

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

## Selecting fields with `publish()` queries

To select fields to return while [publishing documents](/dev-docs/api/document-service#publish)…

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

## Selecting fields with `unpublish()` queries

To select fields to return while [unpublishing documents](/dev-docs/api/document-service#unpublish)…

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

## Selecting fields with `discardDraft()` queries

To select fields to return while [discarding draft versions of documents](/dev-docs/api/document-service#discarddraft) with the Document Service API…

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

## Selecting fields with `count()` queries

To select fields to return while [counting documents](/dev-docs/api/document-service#count) with the Document Service API…

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
