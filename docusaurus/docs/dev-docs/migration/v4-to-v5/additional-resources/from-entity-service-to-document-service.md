---
title: From Entity Service API to Document Service API
description: Learn how to transition from the Entity Service API of Strapi v4 to the Document Service API in Strapi 5
displayed_sidebar: devDocsMigrationV5Sidebar
tags:
- document service API
- upgrade to Strapi 5
---

# Entity Service API to Document Service API migration reference

In Strapi 5, the [Document Service API](/dev-docs/api/document-service) replaces the Entity Service API from Strapi v4 (see [breaking change description](/dev-docs/migration/v4-to-v5/breaking-changes/entity-service-deprecated)).

The present page is intended to give developers an idea of how to migrate away from the Entity Service API, by describing which changes in custom code will be handled by codemods from the [upgrade tool](/dev-docs/upgrade-tool) and which will have to be handled manually.

## Migration using the upgrade tool

When using the [upgrade tool](/dev-docs/upgrade-tool), a codemod is run and handles some parts of the `entityService` migration.

:::caution
The codemod is only changing the function calls and some parameters. This can not be considered as a complete migration as the codemod will never be able to convert an `entityId` into a `documentId`.
:::

### Codemod scope

The following list explains what is automatically handled by the codemod (✅), what is not handled by the codemod and must be handled 100% manually (❌) and what will still require manual intervention after the codemod has run (🚧):

| Topic | Handled by the codemod? | Manual steps to perform |
|-------|------------------------|--------------------------|
| Code structure | ✅ Yes          | Nothing.<br/>The code structure is automatically migrated. |
| `publicationState` removed in favor of [`status`](/dev-docs/api/document-service/status) | ✅ Yes | Nothing.<br/>The codemod automatically transforms it. | 
| Usage of `documentId` instead of the Strapi v4 unique identifiers | 🚧 Partially:<ul><li>The codemod adds the new `documentId` property to your code, since `documentId` is the new unique identifier to use in Strapi 5.</li><li>But the actual `documentId` value can not be guessed, so after the codemod has run, you will find `__TODO__` placeholder values in your code.</li></ul> | <Icon name="arrow-fat-right" /> `__TODO__` placeholder values need to be manually updated.<br/><br/>For instance, you might change<br/>`documentId: "__TODO__"`<br/>to something like<br/>`documentId: "ln1gkzs6ojl9d707xn6v86mw"`.
| Update of `published_at` to trigger publication | ❌ Not handled.<br/> | <Icon name="arrow-fat-right" /> Update your code to use the new [`publish()`](/dev-docs/api/document-service#publish), [`unpublish()`](/dev-docs/api/document-service#publish), and [`discardDraft()`](/dev-docs/api/document-service#publish) methods of the Document Service API instead. |

### Examples of function calls migration

The following examples show how the codemod from the upgrade tool updates the code for various function calls.

#### `findOne`

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

#### `findMany`

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

#### `create`

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

#### `update`

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

#### `delete`

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

#### `count`

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

## Manual migration

- Users who prefer to manually migrate can do so by replicating what the codemod does (see [codemod scope](#codemod-scope) and [function calls examples](#examples-of-function-calls-migration) for reference).

- Plugin developers who use Entity Service decorators in their code must replace them by Document Service middlewares. The following example gives you an idea of how they work, and additional information can be found in the dedicated [Document Service middlewares documentation](/dev-docs/api/document-service/middlewares):

  **In Strapi v4:**

  ```tsx
  strapi.entityService.decorate((service) => {

    return Object.assign(service, {
    
      findOne(entityId, params = {}) {
        // e.g., exclude soft deleted content
        params.filters = { ...params.filters, deletedAt: { $notNull: true } } 
        return service.findOne(entityId, params)
      }
    });
  })
  ```

  **In Strapi 5**

  ```tsx
  strapi.documents.use((ctx, next) => {
    if (ctx.uid !== "api::my-content-type.my-content-type") {
      return next();
    }
    
    if (ctx.action === 'findOne') {
      // customization
      ctx.params.filters = { ...params.filters, deletedAt: { $notNull: true } } 
      const res = await next();
      // do something with the response if you want
      return res;
    }
    
    return next();
  });
  ```

* Update your custom code for `findMany()` on single types, taking into account that:

  - In Strapi v4, the `findMany()` function returns a single item when called on a single type.
  - In Strapi 5, the `findMany()` function is generic and always returns arrays, whether called on a single type or on a collection type. To get data for a single type with a `findMany()` call, extract the first item from the returned array.
