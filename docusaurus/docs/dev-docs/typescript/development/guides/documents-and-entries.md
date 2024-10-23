---
title: TypeScript - Manipulating Documents and Entries
sidebar_label: Manipulating Documents and Entries
description: TypeScript guide to get started with manipulating documents and entries
tags:
- typescript
- guides
- data
- document
- component
- uid
- entries
---

# Manipulating documents and entries

## Prerequisites

- **Strapi Application:** A Strapi v5 application. If you don't have one, follow the [documentation](/dev-docs/quick-start) to get started.
- **TypeScript:** Ensure TypeScript is set up in your Strapi project. You can follow Strapi's [official guide](/dev-docs/typescript#getting-started-with-typescript-in-strapi) on configuring TypeScript.
- **Generated Types:** Application types [have been generated](/dev-docs/typescript/development#generate-typings-for-content-types-schemas) and are accessible.

## Type Imports

The `UID` namespace contains literal unions representing the available resources in the application.

```typescript
import type { UID } from '@strapi/strapi';
```

- `UID.ContentType` represents a union of every content-type identifier in the application
- `UID.Component` represents a union of every component identifier in the application
- `UID.Schema` represents a union of every schema (content-type or component) identifier in the application 
- And others...

---

Strapi provides a `Data` namespace containing several built-in types for entity representation.

```typescript
import type { Data } from '@strapi/strapi';
```

- `Data.ContentType` represents a Strapi document object
- `Data.Component` represents a Strapi component object
- `Data.Entity` represents either a document or a component

:::tip
Both the entities' type definitions and UIDs are based on the generated schema types for your application.

In case of a mismatch or error, you can always [regenerate the types](/dev-docs/typescript/development#generate-typings-for-content-types-schemas). 
:::

## Usage

### Generic Entities

When dealing with generic data, it is recommended to use non-parametrized forms of the `Data` types.

#### Generic documents

```typescript
async function save(name: string, document: Data.ContentType) {
  await writeCSV(name, document);
  //                    ^ {
  //                        id: Data.ID;
  //                        documentId: string;
  //                        createdAt?: DateTimeValue;
  //                        updatedAt?: DateTimeValue;
  //                        publishedAt?: DateTimeValue;
  //                        ...
  //                      }
}
```

:::warning
In the preceding example, the resolved properties for `document` are those common to every content-type.

Other properties have to be checked manually using type guards.

```typescript
if ('my_prop' in document) {
  return document.my_prop;
}
```
:::

#### Generic components

```typescript
function renderComponent(parent: Node, component: Data.Component) {
  const elements: Element[] = [];
  const properties = Object.entries(component);

  for (const [name, value] of properties) {
    //        ^        ^
    //        string   any
    const paragraph = document.createElement('p');
    
    paragraph.textContent = `Key: ${name}, Value: ${value}`;
    
    elements.push(paragraph);
  }
  
  parent.append(...elements);
}
```

### Known entities

When manipulating known entities, it is possible to parametrize `Data` types for better type safety and intellisense.

#### Known documents

```typescript
const ALL_CATEGORIES = ['food', 'tech', 'travel'];

function validateArticle(article: Data.ContentType<'api::article.article'>) {
  const { title, category } = article;
  //       ^?         ^?
  //       string     Data.ContentType<'api::category.category'>

  if (title.length < 5) {
    throw new Error('Title too short');
  }

  if (!ALL_CATEGORIES.includes(category.name)) {
    throw new Error(`Unknown category ${category.name}`);
  }
}
```

#### Known components

```typescript
function processUsageMetrics(id: string, metrics: Data.Component<'app.metrics'>) {
  telemetry.send(id, { clicks: metrics.clicks, views: metrics.views });
}
```
### Advanced use cases

#### Entities subsets

Using the types' second parameter (`TKeys`), it is possible to obtain a subset of an entity.

```typescript
type Credentials = Data.ContentType<'api::acount.acount', 'email' | 'password'>;
//   ^? { email: string; password: string }
```

```typescript
type UsageMetrics = Data.Component<'app.metrics', 'clicks' | 'views'>;
//   ^? { clicks: number; views: number }
```

#### Type Argument Inference

It is possible to bind and restrict an entity type based on other function parameters.

In the following example, the `uid` type is inferred upon usage as `T` and used as a type parameter for the `document`.

```typescript
import type { UID } from '@strapi/strapi';

function display<T extends UID.ContentType>(uid: T, document: Data.ContentType<T>) {
  switch (uid) {
    case 'api::article.article': {
      return document.title;
      //              ^? string
      //     ^? Data.ContentType<'api::article.article'>
    }
    case 'api::category.category': {
      return document.name;
      //              ^? string
      //     ^? Data.ContentType<'api::category.category'>
    }
    case 'api::account.account': {
      return document.email;
      //              ^? string
      //     ^? Data.ContentType<'api::account.account'>
    }
    default: {
      throw new Error(`unknown content-type uid: "${uid}"`);
    }
  }
}
```

When calling the function, the `document` type needs to match the given `uid`.

```typescript
declare const article:  Data.Document<'api::article.article'>;
declare const category: Data.Document<'api::category.category'>;
declare const account:  Data.Document<'api::account.account'>;

display('api::article.article', article);
display('api::category.category', category);
display('api::account.account', account);
// ^ ✅

display('api::article.article', category);
// ^ Error: "category" is not assignable to parameter of type ContentType<'api::article.article'>

```
