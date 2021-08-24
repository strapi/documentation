---
title: Creating Custom Queries - Strapi Developer Documentation
description: (add description here)
---

<!-- This document is currently not listed in the sidebar.
This is a WIP advanced database layer customization guide,
that still needs to be documented by devs.
TODO: check that it's not indexed by Algolia unless we want it to. -->

# Creating Custom Queries

<!-- TODO: DOCUMENT -->

When in need fore more control over the queries than with the Query API you can use the underlying query builder.

> The API will specified at a later time

```js
db.query('article').findOne({});
db.entityManager.findOne('article', {});
```

```js
const qb = db.entityManager.createQueryBuilder('article');

const res = await qb.select('xxx').where({}).populate('xx').execute();
```

**Using QueryBuilder**

This allows doing more lower level queries while keeping some logic management like parsing / formating of values.

We can expose a Query Builder that will expose a fluent API that the repository uses. This woul keep the advantages of using the filter syntax but also smart populate.

```js
const qb = db.getQueryBuilder('article');

const articles = qb
  .select(['a', 'b'])
  .where({ $and: [] })
  .populate()
  .limit()
  .offset()
  .orderBy({ id: 'ASC' })
  .execute();
```

**Access the underlying connection instance**

If you want know logic applied and plain db queries you can access the underlying connection like so

```js
const connection = db.getConnection();
```

TODO: uncomment and update this part based on video explanations


