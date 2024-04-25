---
title: From Entity Service API to Document Service API
description: Learn how to transition from the Entity Service API of Strapi v4 to the Document Service API in Strapi 5
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
- migration
- migration guides
- document service API
---

# Entity Service API to Document Service API migration reference

In Strapi 5, the [Document Service API](/dev-docs/api/document-service) replaces the Entity Service API from Strapi v4. The present page is intended to give developers an idea of how to migrate away from the Entity Service API, by describing which changes in custom code will be handled by codemods from the [upgrade tool](/dev-docs/upgrade-tool) and which will have to be handled manually.

## Changes handled by the upgrade tool

When using the [upgrade tool](/dev-docs/upgrade-tool), a codemod is run and handles some parts of the `entityService` migration.

:::caution
The codemod is only changing the function calls and some parameters. This can not be considered as a complete migration as the codemod will never be able to convert an `entityId` into a `documentId`.
:::

When using the codemod from the upgrade tool:

- The code structure is automatically migrated.
- `publicationState` is automatically transformed into `status`

The following examples show how the codemod from the upgrade tool updates the code from various function calls.

### `findOne`

<Columns>
<ColumnLeft>

**Before:**

```tsx
strapi.entityService.findOne(uid, entityId);


```

</ColumnLeft>

<ColumnRight>

**After:**

```tsx
strapi.documents(uid).findOne({
  documentId: "__TODO__"
});
```

</ColumnRight>

</Columns>

### `findMany`

<Columns>
<ColumnLeft>

**Before:**

```tsx
strapi.entityService.findMany(uid, {
  fields: ["id", "name", "description"],
  populate: ["author", "comments"],
  publicationState: "preview",
});
```

</ColumnLeft>

<ColumnRight>

**After:**

```tsx
strapi.documents(uid).findMany({
  fields: ["id", "name", "description"],
  populate: ["author", "comments"],
  status: "draft",
});
```

</ColumnRight>
</Columns>

### `create`

<Columns>
<ColumnLeft>

**Before:**

```tsx
strapi.entityService.create(uid, {
  data: {
    name: "John Doe",
    age: 30,
  },
});
```

</ColumnLeft>
<ColumnRight>

**After:**

```tsx
strapi.documents(uid).create({
  data: {
    name: "John Doe",
    age: 30,
  },
});
```

</ColumnRight>
</Columns>

### `update`

<Columns>
<ColumnLeft>

**Before:**

```tsx
strapi.entityService.update(uid, entityId, {
  data: {
    name: "John Doe",
    age: 30,
  }
});

```

</ColumnLeft>
<ColumnRight>

**After:**

```tsx
strapi.documents(uid).update({
  documentId: "__TODO__",
  data: {
    name: "John Doe",
    age: 30,
  }
});
```

</ColumnRight>
</Columns>

### `delete`

<Columns>
<ColumnLeft>

**Before:**

```tsx
strapi.entityService.delete(uid, entityId);


```

</ColumnLeft>
<ColumnRight>

**After:**

```tsx
strapi.documents(uid).delete({
  documentId: "__TODO__"
});
```

</ColumnRight>
</Columns>

### `count`

<Columns>
<ColumnLeft>

**Before:**

```tsx
strapi.entityService.count(uid);
```

</ColumnLeft>
<ColumnRight>

**After:**

```tsx
strapi.documents(uid).count();
```

</ColumnRight>
</Columns>



## Changes to handle manually

- We cannot guess the document id so we add a `__TODO__` to make it easily searchable and replacable by users
- Previsouly they where changing the published_at to publish now they have to use the publis/unpublish/discardraft methods and we cannot auto migrate that

***

- The delete function returns a list of entries affected (multiple locales can be deleted at once) before it was just returning the deleted entry

Depending on where we run that code they might have already access to the documentId after migrating (e.g when using the core services 

**Manual migration**

---

- User can manually do the migration the codemod operates too if they prefer it.
- If they where using other non-documented methods they will have to refactor their code to use doc service methods

**Decorators (For plugin developers)**

- The entity service decorators have been replaced by the document service middlewares

**Before**

```tsx
strapi.entityService.decorate((service) => {

	return Object.assign(service, {
	
		findOne(entityId, params = {}) {
			// e.g soft exclude soft deleted content
			params.filters = { ...params.filters, deletedAt: { $notNull: true } } 
			return service.findOne(entityId, params)
		}
	});
})
```

**After** (full doc in the doc-service documentation)

```tsx
strapi.documents.use((ctx, next) => {
	if (ctx.uid !== "api::myct.myct") {
		return next();
	}
	
	if (ctx.action === 'findOne') {
		// customization
		ctx.params.filters = { ...params.filters, deletedAt: { $notNull: true } } 
		const res = await next();
		// do sth with the res if you want
		return res;
	}
	
	return next();
});
```

**SingleTypes**

- In v4 the findMany function was returning a single item when called for a single type.
- In v5 the findMany is generic and only returns arrays. user will have to extra the 1st item from the array
