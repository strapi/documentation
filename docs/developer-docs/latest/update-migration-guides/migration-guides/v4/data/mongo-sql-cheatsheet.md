---
title: MongoDB vs. SQL cheatsheet for Strapi v3 - Strapi Developer Docs
description: Learn how MongoDB and SQL implementations differ in Strapi v3
canonicalUrl:  http://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides/v4/data/mongo.html
---

# MongoDB vs. SQL implementation cheatsheet

## Differences between Mongo and SQL

ℹ️ This section explains the keys structural differences in the databases to take into account when migrating your data from MongoDB to SQL in the context of a Strapi project.

### Settings

**Naming conventions**

- **table/collection name**
    
    In both **SQL** and **Mongo** it uses the `collectionName` option defined in the `model.settings.json` file. 
    
    When doing the switch from **Mongo** to **SQL** there will be one table per collection created and new tables for relations when switching to **SQL.**
    
1. **column/field names**
    
    in both **SQL** and **Mongo** the column/field is created with the same name as the attributes
    
    **example**
    
     
    
    ```json
    //model
    {
    	"attributes": {
    		"attribute_a": {
    		  "type": "string"
        }
    }
    
    // Mongo
    {
      "_id": ObjectId("1")
    	"attribute_a": "abcd"
    }
    
    // SQL
    {
      "id": 1
    	"attribute_a": "abcd"
    }
    ```
    

**Timestamps**

if the `timestamps` option is defined in the `model.settings.js` file, the properties will be the same in **Mongo** and **SQL**.

If no timestamps option is set then the defaults have to be migrated:

- In **mongo:** `createdAt`  in **SQL**: `created_at`
- In **mongo:** `updatedAt`  in **SQL**: `updated_at`

### Relations

<aside>
ℹ️ Custom column name for relations are broken and not used in both mongo and SQL. It means no specific migrations are needed for this case and can be considered as if they were not used.

</aside>

**Relations list**

- `oneWay`
    
    In **mongo** the id of the relation is in the document and is named after the property in the `model.settings.json` file.
    
    In **sql** the relation is also a column in the row and is name after the property in the `model.settings.json` file.·
    
    **Example**
    
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
    
    Mongo
    
    ```json
    // A
    {
    	"_id": ObjectId("1"),
      "one_way": ObjectId("1")
    }
    
    // B
    {
    	"_id": ObjectId("1")
    }
    ```
    
    SQL
    
    ```json
    // A
    {
    	"id": 1,
      "one_way": 1
    }
    
    // B
    {
    	"id": 1
    }
    ```
    
- `oneToOne`
    
    In **mongo** the id of the relation is in the two documents at the same time and is following the names in the `model.settings.json` file.
    
    In **sql** the id of the relation is in the two tables at the same time and is following the names in the `model.settings.json` file.
    
    **example**
    
    Model
    
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
    
    Mongo
    
    ```json
    // A
    {
    	"_id": ObjectId("1")
      "one_to_one": ObjectId("1")
    }
    
    // B
    {
    	"_id": ObjectId("1")
      "one_to_one_via": ObjectId("1")
    }
    ```
    
    SQL
    
    ```json
    // A
    {
    	"id": 1
      "one_to_one": 1
    }
    
    // B
    {
    	"id": 1
      "one_to_one_via": 1
    }
    ```
    
- `oneToMany`
    
    The relation is stored on the opposite side in both **mongo** and **sql**
    
    **Example**
    
    Model
    
    ```json
    // model A
    {
      "attributes": {
    		"one_to_many": {
    			"collection": "B",
          "via": "many_to_one"
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
    ```
    
    Mongo
    
    ```json
    // A
    {
      "_id": ObjectId("1")
    }
    
    // B
    {
      "_id": ObjectId("1"),
      "many_to_one": ObjectId("1")
    }
    ```
    
    SQL
    
    ```json
    // A
    {
      "id": 1
    }
    
    // B
    {
      "id": 1,
      "many_to_one": 1
    }
    ```
    
- `manyToOne`
    
    It is simply the inverse of the `oneToMany`.
    
    In both **mongo** and **SQL** the relation is stored in the main model
    
    **Example**
    
    Model
    
    ```json
    // model A
    {
      "attributes": {
    		"many_to_one": {
    			"model": "B",
          "via": "one_to_many"
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
    ```
    
    Mongo
    
    ```json
    // A
    {
      "_id": ObjectId("1"),
      "many_to_one": ObjectId("1")
    }
    
    // B
    {
      "_id": ObjectId("1")
    }
    ```
    
    SQL
    
    ```json
    // A
    {
      "id": 1,
      "many_to_one": 1
    }
    
    // B
    {
      "id": 1
    }
    ```
    
- `manyToMany`
    
    In **mongo** the relation ids are stored in an array in the side where the `dominant` property is `true`
    
    In **SQL** the relation is stored in a link table. the name of the link table can be found following this [guide](https://www.notion.so/Mongo-to-SQL-migration-2c47f80114bb48b298edd386a47138c1).
    
    **Example**
    
    Model
    
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
    
    Mongo
    
    ```json
    // A
    {
      "_id": ObjectId("1"),
      "many_to_many": [
    	  ObjectId("1")
      ]
    }
    
    // B
    {
    	"_id": ObjectId("1")
    }
    ```
    
    SQL
    
    ```json
    // A
    {
    	"id": 1,
    }
    
    // B
    
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
    
- `manyWay`
    
    Simpler version of a `manyToMany`. The data is stored in the mode where the relation is declared in **Mongo** and in a join table in **SQL**
    
    In **SQL** the relation is stored in a link table. the name of the link table can be found following this [guide](https://www.notion.so/Mongo-to-SQL-migration-2c47f80114bb48b298edd386a47138c1).
    
    **Example**
    
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
    
    Mongo
    
    ```json
    // A
    {
      "_id": ObjectId("1"),
      "many_way": [
    	  ObjectId("1")
      ]
    }
    
    // B
    {
    	"_id": ObjectId("1")
    }
    ```
    
    SQL
    
    ```json
    // A
    {
    	"id": 1,
    }
    
    // B
    
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
    

- **Finding the table name for the link tables**
    
    The link table name is generated based on the `collectionName` property, the `attributes` of the relationship, and the type of the `relation`.
    
    - `manyWay` relations have the join table follows this naming pattern: `{collectionName}__${snakeCase(attributeName)}`
        
        **Example**
        
        ```sql
        // Model A
        {
        	"collectionName": "table_a",
          "attributes": {
            "myManyWay": {
              //...
            }
        }
        
        // Link table will be
        "table_a__my_many_way"
        ```
        
    - `manyToMany` relations have the join table following this pattern: `{}_{}`
    

### Components & Dynamic zones

In **Mongo** and **SQL** components have their own collection and are links to their parent. 

- In **Mongo,** the links are done via an array of objects stored in the parent. This is always an array even with non-repeatable `components`
    - Each object has a `kind` and a `ref` property to target a specific component*`(ref)`* from a specific collection*`(kind)`*.
- In **SQL** the links are done via a link table
    
    → The table name is generated following this pattern: `{collectionName}_components` where `collectionName`
    
    - The `component_type` column is using the `collectionName` and not the `globalId` property
    - There is a `field` column that should be equal to the attribute name
    - There is an `order` column that should go from 1 to x matching the order of the **Mongo** Array
    - There is a `component_id` foreign key targeting the component table
    - There is a foreign key targeting the parent table following this `{singular(collectionName)}_id`

**Example**

Model

```json
// model A
{
	"attributes": {
		"compo": {
			"type": "component"
			"repeatable": true|false
		}
}

// model Compo
{
	"attributes": {}
}
```

Mongo

```json
// A
{
	"_id": ObjectId("1"),
  "compo": [
		{
			"_id": ObjectId("xxx"), // this id doesn't matter
			"kind": "CompoGlobalId", // need to convert this to the collectionName before creating the link in SQL
			"ref": ObjectId("1") //actual id of the component
		}
	]
}

// Compo
{
	"_id": ObjectId("1"),
}
```

SQL

```json
// A
{
	"id": 1,
}

// Compo
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

### Medias

In **Mongo,** media are stored the same way as in **SQL**. However, the links made between media and entries are stored differently.

- In **Mongo,** the media links are stored on both sides of the relation
    - There is a property called `related` which is an Array of objects targeting the related entries in the media collection (called `upload_file`)
        - Each object has a `kind`, a `ref`, and a `field` property to target a specific media*`(ref)`* for a specific collection*`(kind)`* and for a specific attribute*`(field)`*
    - There is a property in the entries named like the media attributes of the models which is either an Array or a single `ObjectId` target the media(s)
- In **SQL** there is a link table called `upload_file_morph`
    - There is a `upload_file_id` foreign key targeting the media
    - There is a `related_id` column targeting the entry
    - There  is a `related_type`
    

**Example**

Model

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

Mongo

```json
// A
{
	"_id": ObjectId("1"),
	"pictures": [
		ObjectId("1"),
	]
}

// B
{
	"_id": ObjectId("1"),
	"cover": ObjectId("1")
}

// upload_file

{
	"_id": ObjectId("1"),
	//...
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

SQL

```json
// A
{
	"id": 1,
}

// B
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

### Scalar attributes

There are no structural changes in the scalar attributes. Here is the only difference to take into account:

- `time`: stores milliseconds but should not be a problem
- `json`: object in mongo. make sure to stringify if necessary in the SQL DB you target (sqlite, MySQL < 5.6)

### Attributes create by strapi

*(without timestamps)*

- `published_at`: is the same in any DB
- `created_by`: is the same in any DB
- `updated_by`: is the same in any DB
- `locale`: is the same in any DB
- `localizations`: it is a many way relation refer to [https://www.notion.so/strapi/Mongo-to-SQL-migration-2c47f80114bb48b298edd386a47138c1#f1a375dd67d043a093e5f38e62da50cd](https://www.notion.so/Mongo-to-SQL-migration-2c47f80114bb48b298edd386a47138c1)

## Data

ℹ️ This section explains the differences in value and formats to take into account when migrating your data from **Mongo** to **SQL** in the context of a Strapi project.

***

There are no difference in the models and migrating data in an iso way should work.

## Some possible exceptions

| Name | Description |
| -- | -- |
|Custom id types|	only in SQL so shouldn’t be a problem
|Custom indexing|	This is not a supported feature. Users must recreate the equivalent indexes in SQL manually
|Custom join table names	|This must be taken into account when migrating the relations to find the right table name
|Custom DB queries|	Users should migrate to v3 SQL then v4 and finally migrate the custom queries with the v4 query engine
