---
title: MongoDB vs. SQL cheatsheet
description: Learn how MongoDB and SQL implementations differ in Strapi v3
displayed_sidebar: devDocsSidebar
---

# MongoDB vs. SQL implementation differences in Strapi v3

This documentation explains the key structural differences to take into account when migrating data from MongoDB to SQL in the context of a Strapi v3 project. It should be used as a reference when migrating data locally (see [MongoDB to SQL migration in Strapi v3](/dev-docs/migration/v3-to-v4/data/mongo)).

## Model settings

The `model.settings.json` files, used to define models in Strapi v3, include parameters that are handled differently by MongoDB and SQL databases.

### Naming conventions

**Table/collection names**

Table in SQL databases, equivalent to collection in MongoDB, are created with the name defined in the `collectionName` option of the `model.settings.json` file.

When switching from MongoDB to SQL, one SQL table is created per MongoDB collection, and new SQL tables are created for [relations](#relations).

**Column/field names**

Columns in SQL, equivalent to fields in MongoDB, are created with the names defined in the `attributes` option of the `model.setting.json` file. 

An example `attribute_a` defined in `model.settings.json` would be stored like the following in MongoDB and SQL databases:

```json
// model.settings.json
{
  "attributes": {
    "attribute_a": {
      "type": "string"
    }
  }
}
```

<Columns>
<ColumnLeft title="MongoDB">

```json
{
  "_id": ObjectId("1")
  "attribute_a": "abcd"
}
```
</ColumnLeft>

<ColumnRight title="SQL">

```json
{
  "id": 1
  "attribute_a": "abcd"
}
```
</ColumnRight>
</Columns>

### Timestamps

If the `timestamps` option is defined in the `model.settings.js` file, no migration is required, the properties will be the same in MongoDB and SQL databases.

If no `timestamps` option is set, the defaults should be migrated, using lower snake case in SQL databases:

| Field name in MongoDB | Field name in SQL databases |
| --------------------- | --------------------------- |
| `createdAt`           | `created_at`                |
| `updatedAt`           | `updated_at`                |

## Relations

:::note
Custom column names for relations can't be used in both MongoDB and SQL databases. No specific migrations are needed for this case and custom column names can be considered as if they were not used.
:::

In Strapi, relations between models are defined in the `attributes` section of the `model.settings.json` files.

The following section explains how each type of relation is declared in the model attributes and gives an example of how the model attributes are reflected in the MongoDB and SQL databases:

<Tabs>
<TabItem value="one-way" title="oneWay">

In MongoDB, the id of a `oneWay` relation is in the document and is named after the property in the `model.settings.json` file.

In SQL databases, the `oneWay` relation is a column in the row and is named after the property in the `model.settings.json` file.

**Models:**

```json
// model A
{
  "attributes": {
    "one_way": {
      "model": "test-a"
    }
  }
}

// model B
{
  "attributes": {
    // no attributes on the other side
  }
}
```

<Columns>
<ColumnLeft title="MongoDB">

```json
// model A
{
  "_id": ObjectId("1"),
  "one_way": ObjectId("1")
}

// model B
{
  "_id": ObjectId("1")
}
```
</ColumnLeft>

<ColumnRight title="SQL">

```json
// model A
{
  "id": 1,
  "one_way": 1
}

// model B
{
  "id": 1
}
```
</ColumnRight>
</Columns>

</TabItem>

<TabItem value="one-to-one" title="oneToOne">

In MongoDB, the id of a `oneToOne` relation is in the 2 documents at the same time, and uses the names defined in the `model.settings.json` file.

In SQL databases, the id of a `oneToOne` relation is also in the 2 tables at the same time, and uses the names defined in the `model.settings.json` file.

**Models:**

```json
// model A
{
  "attributes": {
    "one_to_one": {
      "model": "B",
      "via": "one_to_one_via"
    }
  }
}

// model B
{
  "attributes": {
    "one_to_one_via": {
      "model": "A",
      "via": "one_to_one"
    }
  }
}
```

<Columns>
<ColumnLeft title="MongoDB">

```json
// model A
{
  "_id": ObjectId("1")
  "one_to_one": ObjectId("1")
}

// model B
{
  "_id": ObjectId("1")
  "one_to_one_via": ObjectId("1")
}
```
</ColumnLeft>

<ColumnRight title="SQL">

```json
// model A
{
  "id": 1
  "one_to_one": 1
}

// model B
{
  "id": 1
  "one_to_one_via": 1
}
```
</ColumnRight>
</Columns>

</TabItem>

<TabItem value="one-to-many" title="oneToMany">

A `oneToMany` relation is stored on the opposite side of the relation in both MongoDB and SQL databases.

**Models:**

```json
// model A
{
  "attributes": {
    "one_to_many": {
      "collection": "B",
      "via": "many_to_one"
    }
  }
}

// model B
{
  "attributes": {
    "many_to_one": {
      "model": "A",
      "via": "one_to_many"
    }
  }
}
```

<Columns>
<ColumnLeft title="MongoDB">

```json
// model A
{
  "_id": ObjectId("1")
}

// model B
{
  "_id": ObjectId("1"),
  "many_to_one": ObjectId("1")
}
```
</ColumnLeft>

<ColumnRight title="SQL">

```json
// model A
{
  "id": 1
}

// model B
{
  "id": 1,
  "many_to_one": 1
}
```
</ColumnRight>
</Columns>

</TabItem>

<TabItem value="many-to-one" title="manyToOne">

A `manyToOne` relation is the inverse of a `oneToMany` relation.

In both MongoDB and SQL databases, the relation is stored in the main model.

**Models:**

```json
// model A
{
  "attributes": {
    "many_to_one": {
      "model": "B",
      "via": "one_to_many"
    }
  }
}

// model B
{
  "attributes": {
    "one_to_many": {
      "collection": "A",
      "via": "many_to_one"
    }
  }
}
```

<Columns>
<ColumnLeft title="MongoDB">

```json
// model A
{
  "_id": ObjectId("1"),
  "many_to_one": ObjectId("1")
}

// model B
{
  "_id": ObjectId("1")
}
```
</ColumnLeft>

<ColumnRight title="SQL">

```json
// model A
{
  "id": 1,
  "many_to_one": 1
}

// model B
{
  "id": 1
}
```
</ColumnRight>
</Columns>

</TabItem>

<TabItem value="many-to-many" title="manyToMany">

In MongoDB, the ids of a `manyToMany` relation are stored in an array in the side where the `dominant` property is `true`.

In SQL databases, a `manyToMany` relation is stored in a join table whose name follows a specific naming convention (see [SQL join table names](#sql-join-table-names)).

**Models:**

```json
// model A
{
  "attributes": {
    "many_to_many": {
      "collection": "B",
      "via": "many_to_many_rev",
      "dominant": true
    }
  }
}

// model B
{
  "attributes": {
    "many_to_many_rev": {
      "via": "many_to_many",
      "collection": "kitchensink"
    }
  }
}
```

<Columns>
<ColumnLeft title="MongoDB">

```json
// model A
{
  "_id": ObjectId("1"),
  "many_to_many": [
    ObjectId("1")
  ]
}

// model B
{
  "_id": ObjectId("1")
}
```
</ColumnLeft>

<ColumnRight title="SQL">

```json
// model A
{
  "id": 1,
}

// model B
{
  "id": 1
}

// link_table
{
  "id": 1,
  "a_id": 1,
  "b_id": 1
}
```
</ColumnRight>
</Columns>

</TabItem>

<TabItem value="many-way" title="manyWay">

A `manyWay` relation is a simplified version of a `manyToMany` relation.

The data is stored in the model, where the relation is declared in MongoDB and in a join table in SQL databases.

In SQL databases, the relation is stored in a join table whose name follows a specific naming convention (see [SQL join table names](#sql-join-table-names)).

**Models:**

```json
// model A
{
  "attributes": {
    "many_way": {
      "collection": "test-a"
    }
  }
}

// model B
{
  "attributes": {
    // no attributes on the other side
  }
}
```

<Columns>
<ColumnLeft title="MongoDB">

```json
// model A
{
  "_id": ObjectId("1"),
  "many_way": [
    ObjectId("1")
  ]
}

// model B
{
  "_id": ObjectId("1")
}
```
</ColumnLeft>

<ColumnRight title="SQL">

```json
// model A
{
  "id": 1,
}

// model B
{
  "id": 1
}

// a__many_way
{
  "id": 1,
  "a_id": 1,
  "b_id": 1
}
```
</ColumnRight>
</Columns>

</TabItem>

</Tabs>

### SQL join table names
  
The name for the SQL join table used in `manyToMany` and `manyWay` relations is generated based on the `collectionName` property, the `attributes` of the relation, and the type of the `relation`:

- `manyToMany` relations have the join table follow this naming pattern: `{}_{}`

- `manyWay` relations have the join table follow this naming pattern: `{collectionName}__${snakeCase(attributeName)}`, like in the following example:

    ```json
    // With the following model A:
    {
      "collectionName": "table_a",
      "attributes": {
        "myManyWay": {
          // ...
        }
      }
    }
    
    // The SQL join table name will be:
    "table_a__my_many_way"
    ```

## Components & Dynamic zones

In both MongoDB and SQL databases, components have their own collection and are links to their parent. 

In MongoDB, the links are done via an array of objects stored in the parent. Even non-repeatable `components` are listed in an array. Each object from this array has 2 properties:

- `ref` targets a specific component
- `kind` targets a specific collection

In SQL databases, the links are done with a SQL join table. The table name is generated following this pattern: `{collectionName}_components`, where `collectionName` is in the parent model. SQL tables for components include the following elements:

| Name                            | Type        | Description                                                    |
| ------------------------------- | ----------- | -------------------------------------------------------------- |
| `component_type`                | Column      | Uses the `collectionName` and not the `globalId` property      |
| `field`                         | Column      | Should be equal to the attribute name                          |
| `order`                         | Column      | Should go from 1 to x, matching the order in the MongoDB array |
| `component_id`                  | Foreign key | Targets the component table                                    |
| `{singular(collectionName)}_id` | Foreign key | Targets the parent table                                       |

<details>
<summary>Example of a component definition in model settings, MongoDB and SQL databases in Strapi v3</summary>

**Models:**

```json
// model A
{
  "attributes": {
    "compo": {
      "type": "component"
      "repeatable": true|false
    }
  }
}

// Component
{
  "attributes": {}
}
```

**Mongo:**

```json
// model A
{
  "_id": ObjectId("1"),
  "compo": [
    {
      "_id": ObjectId("xxx"), // this id doesn't matter
      "kind": "CompoGlobalId", // to be converted to collectionName before creating the join in SQL
      "ref": ObjectId("1") // actual id of the component
    }
  ]
}

// Component
{
  "_id": ObjectId("1"),
}
```

**SQL:**

```json
// model A
{
  "id": 1,
}

// Component
{
  "id": 1,
}

// A_components
{
  "id": 1,
  "field": "compo",
  "order": 1,
  "component_type": "compos",
  "component_id": 1,
  "a_id": 1
}
```

</details>

## Media

Media are stored the same way in MongoDB and in SQL. However, the links created between media and entries are stored differently:

In MongoDB, media links are stored on both sides of the relation. The `related` property is an array of objects targeting the related entries in the media collection, called `upload_file`. Each object has 3 properties:

- `ref` targets a specific media
- `kind` targets a specific collection
- `field` targets a specific attribute

MongoDB also includes a property in the entries, named like the media attributes of the models, which is either an array or a single `ObjectId` targeting the media(s).

In SQL databases, an `upload_file_morph` join table is created, with the following elements:

| Name             | Type        | Description       |
| ---------------- | ----------- | ----------------- |
| `upload_file_id` | Foreign key | Targets the media |
| `related_id`     | Column      | Targets the entry |
| `related_type`   |             |                   |
<!-- TODO: complete the table above -->
<!-- ? what does related_type is used for? it was not in the notes 😅 -->

<details>
<summary>Example of media definition in model settings, MongoDB, and SQL databases in Strapi v3</summary>
**Models:**

```json
// model A
{
  "attributes": {
    "pictures": {
      "plugin": "upload",
      "collection": "file", // multiple files
      "via": "related",
      
    }
  }
}

// model B
{
  "attributes": {
    "cover": {
      "plugin": "upload",
      "model": "file", // single file
      "via": "related",
    }
  }
}

```

**MongoDB:**

```json
// model A
{
  "_id": ObjectId("1"),
  "pictures": [
    ObjectId("1"),
  ]
}

// model B
{
  "_id": ObjectId("1"),
  "cover": ObjectId("1")
}

// upload_file
{
  "_id": ObjectId("1"),
  // ...
  "related": [
    {
      "_id": ObjectId("1"), // this id doesn't matter
      "kind": "GlobalIdOfA", // needs to be converted to collectionName for SQL
      "ref": ObjectId("1"), // id of the A entry
      "field": "pictures", // field in A to which the media is linked
    },
    {
      "_id": ObjectId("2"), // this id doesn't matter
      "kind": "GlobalIdOfB", // needs to be converted to collectionName for SQL
      "ref": ObjectId("1"), // id of the B entry
      "field": "cover", // field in B to which the media is linked
    }
  ]
}
```

**SQL:**

```json
// model A
{
  "id": 1,
}

// model B
{
  "_id": 1,
}

// upload_file
{
  "id": 1,
}

// upload_file_morph
[
  {
    "id": 1, // this id doesn't matter
    "upload
    "related_type": "collectionNameofA", // collectionName of A
    "related_id": 1, // id of the A entry
    "field": "pictures", // field in A to which the media is linked
    "order": 1,
  },
  {
    "id": 2, // this id doesn't matter
    "related_type": "collectionNameofB", // needs to be converted to collectionName for SQL
    "related_id": 1, // id of the B entry
    "field": "cover", // field in B to which the media is linked
    "order": 1
  }
]
```

</details>

## Scalar attributes

There are no structural changes in the scalar attributes between MongoDB and SQL databases.

The only differences to take into account are the following:

- `time` stores milliseconds.
- `json` is an object in MongoDB. Make sure to stringify it if necessary in the SQL database you target (SQLite or MySQL < 5.6).

## Attributes created by Strapi

With the exception of [timestamps](#timestamps), attributes created by Strapi are the same in Mongo and SQL databases. This includes the following attributes:

- `published_at`
- `created_by`
- `updated_by`
- `locale`

`localizations` is a `manyWay` relation (see [relations](#relations)).

## Custom use cases

The following table highlights some specific uses cases and their possible resolution:

| Use case                | Resolution                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------- |
| Custom id types         | Custom ID types are only used in SQL. No migration is required since the feature is not supported in MongoDB. |
| Custom indexing         | Custom indexing is not a supported feature. Equivalent indexes must be created in SQL manually.               |
| Custom join table names | Custom join table names should be taken into account when migrating the [relations](#relations) to find the right table name               (see [SQL join table names](#sql-join-table-names)). |
| Custom DB queries       | Migrate to v3 SQL then to Strapi v4, and finally migrate the custom queries with the [Query Engine](/dev-docs/api/query-engine) of Strapi v4. |
