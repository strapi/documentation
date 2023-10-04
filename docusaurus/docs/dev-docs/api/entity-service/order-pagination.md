---
title: Ordering & Pagination
description: Use Strapi's Entity Service API to order and paginate queries results.
displayed_sidebar: devDocsSidebar
---

# Ordering & Pagination

The [Entity Service API](/dev-docs/api/entity-service) offers the ability to [order](#ordering) and [paginate](#pagination) results found with its [findMany()](/dev-docs/api/entity-service/crud#findmany) method.

## Ordering

To order results returned by the Entity Service API, use the `sort` parameter. Results can be ordered based on a [single](#single) or on [multiple](#multiple) attribute(s) and can also use [relational ordering](#relational-ordering).

### Single

To order results by a single field, pass it to the `sort` parameter either:

- as a `string` to sort with the default ascending order, or
- as an `object` to define both the field name and the order (i.e. `'asc'` for ascending order or `'desc'` for descending order)

```js
strapi.entityService.findMany('api::article.article', {
  sort: 'id',
});

// single with direction
strapi.entityService.findMany('api::article.article', {
  sort: { id: 'desc' },
});
```

### Multiple

To order results by multiple fields, pass the fields as an array to the `sort` parameter either:

- as an array of strings to sort multiple fields using the default ascending order, or
- as an array of objects to define both the field name and the order (i.e. `'asc'` for ascending order or `'desc'` for descending order)

```js
strapi.entityService.findMany('api::article.article', {
  sort: ['publishDate', 'name'],
});

// multiple with direction
strapi.entityService.findMany('api::article.article', {
  sort: [{ title: 'asc' }, { publishedAt: 'desc' }],
});
```

### Relational ordering

Fields can also be sorted based on fields from relations:

```js
strapi.entityService.findMany('api::article.article', {
  sort: {
    author: {
      name: 'asc',
    },
  },
});
```

## Pagination

Results can be paginated using 2 different strategies (see [REST API documentation](/dev-docs/api/rest/sort-pagination#pagination) for more details):

- pagination by page, when defining the `page` and `pageSize` parameters,
- and pagination by offset, when defining the `start` and `limit` parameters.

2 different functions can be used to paginate results with the Entity Service API and accept different pagination strategies: 

| Function name | Possible pagination method(s)                               |
| ------------- | ----------------------------------------------------------- |
| `findMany()`  | Offset pagination only                                      |
| `findPage()`  | <ul><li>Offset pagination</li><li>Page pagination</li></ul> |

<Tabs>
<TabItem value="find-many" label="findMany()">

`findMany()` should only be used with offset pagination:

```js
strapi.entityService.findMany('api::article.article', {
  start: 10,
  limit: 15,
});
```

</TabItem>
<TabItem value="find-page" label="findPage()">

`findPage()` accepts both offset and page pagination, provided you use only one pagination strategy per query:

<Tabs>
<TabItem value="offset-pagination" label="Offset pagination">

```js
strapi.entityService.findPage('api::article.article', {
  start: 10,
  limit: 15,
});
```

</TabItem>

<TabItem value="page-pagination" label="Page pagination">

```js
strapi.entityService.findPage('api::article.article', {
  page: 1,
  pageSize: 15,
});
```

</TabItem>

</Tabs>

</TabItem>
</Tabs>
