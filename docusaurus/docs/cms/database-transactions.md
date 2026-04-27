---
title: Database transactions
description: Conceptual guide to transactions in Strapi
tags:
  - database
  - experimental
---

# Database transactions

<Tldr>
Database transactions group several operations so they succeed or roll back as a unit. The experimental `strapi.db.transaction` helper exposes `trx`, commit, and rollback utilities for wrapped service calls.
</Tldr>

:::caution
This is an experimental feature and is subject to change in future versions.
:::

Strapi 5 provides an API to wrap a set of operations in a transaction that ensures the integrity of data.

Transactions are a set of operations that are executed together as a single unit. If any of the operations fail, the entire transaction fails and the data is rolled back to its previous state. If all operations succeed, the transaction is committed and the data is permanently saved to the database.

## Usage

Transactions are handled by passing a handler function into `strapi.db.transaction`:

```js
await strapi.db.transaction(async ({ trx, rollback, commit, onCommit, onRollback }) => {
  // It will implicitly use the transaction
  const article = await strapi.documents('api::article.article').create({
    data: { title: 'My Article', slug: 'my-article' },
  });

  await strapi.documents('api::log.log').create({
    data: { action: 'article_created', targetId: article.documentId },
  });
});
```

After the transaction handler is executed, the transaction is committed if all operations succeed. If any of the operations throws, the transaction is rolled back and the data is restored to its previous state.

:::note
Every [Document Service API](/cms/api/document-service), `strapi.db.query`, and `strapi.entityService` operation performed inside a `strapi.db.transaction` block will implicitly use the transaction. Strapi uses <ExternalLink to="https://nodejs.org/api/async_context.html#class-asynclocalstorage" text="AsyncLocalStorage"/> to propagate the transaction context, so there is no need to pass the transaction object explicitly to these APIs.
:::

### Transaction handler properties

The handler function receives an object with the following properties:

| Property     | Description                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------- |
| `trx`        | The transaction object. It can be used to perform knex queries within the transaction.      |
| `commit`     | Function to commit the transaction.                                                         |
| `rollback`   | Function to rollback the transaction.                                                       |
| `onCommit`   | Function to register a callback that will be executed after the transaction is committed.   |
| `onRollback` | Function to register a callback that will be executed after the transaction is rolled back. |

### Nested transactions

Transactions can be nested. When a transaction is nested, the inner transaction is committed or rolled back when the outer transaction is committed or rolled back.

```js
await strapi.db.transaction(async () => {
  // It will implicitly use the transaction
  await strapi.documents('api::article.article').create({
    data: { title: 'My Article', slug: 'my-article' },
  });

  // Nested transactions will implicitly use the outer transaction
  await strapi.db.transaction(async () => {
    await strapi.documents('api::category.category').create({
      data: { name: 'Tech' },
    });
  });
});
```

### onCommit and onRollback

The `onCommit` and `onRollback` hooks can be used to execute code after the transaction is committed or rolled back.

```js
await strapi.db.transaction(async ({ onCommit, onRollback }) => {
  // It will implicitly use the transaction
  const user = await strapi.documents('api::user.user').create({
    data: { username: 'johndoe', email: 'john@example.com' },
  });

  onCommit(() => {
    // This will be executed after the transaction is committed,
    // e.g., send a welcome email
  });

  onRollback(() => {
    // This will be executed after the transaction is rolled back,
    // e.g., log the failure
  });
});
```

### Using knex queries

Transactions can also be used with knex queries, but in those cases `.transacting(trx)` must be explicitly called.

```js
await strapi.db.transaction(async ({ trx, rollback, commit }) => {
  await knex('users').where('id', 1).update({ name: 'foo' }).transacting(trx);
});
```

## When to use transactions

Transactions should be used in cases where multiple operations should be executed together and their execution is dependent on each other. For example, when creating a new user, the user should be created in the database and a welcome email should be sent to the user. If the email fails to send, the user should not be created in the database.

## When not to use transactions

Transactions should not be used for operations that are not dependent on each other since it can result in performance penalties.

## Potential problems of transactions

Performing multiple operations within a transaction can lead to locking, which can block the execution of transactions from other processes until the original transaction is complete.

Furthermore, transactions can stall if they are not committed or rolled back appropriately.

For example, if a transaction is opened but there is a path in your code that does not close it, the transaction will be left open indefinitely and could cause instability until your server is restarted and the connection is forced to close. These issues can be difficult to debug, so use transactions with care in the cases they are necessary.
