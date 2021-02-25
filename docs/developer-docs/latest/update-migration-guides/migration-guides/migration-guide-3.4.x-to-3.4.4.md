# Migration guide from 3.4.x to 3.4.4

**Make sure your server is not running until the end of the migration**

:::warning
If you are using **extensions** to create custom code or modifying existing code, you will need to update your code and compare your version to the new changes on the repository.
<br>
Not updating your **extensions** can break your app in unexpected ways that we cannot predict.
:::

## Migration

### 1. Update the application dependencies

First, update the application dependencies as usual by following the basic [version update guide](../update-version.md).

### 2. Migrate Instagram Login Config

If you use or plan to use the **Instagram login**, this migration is **required**. Otherwise it is just recommended to do it (in case you use it one day).

Recently Instagram shutdown their API in favor of a new one (see [https://www.instagram.com/developer/](https://www.instagram.com/developer/)). As a result, the scope Strapi uses for the instagram API has to be updated.

#### For SQL databases:

- In your database, find the table `core_store`
- In that table, find the row with the key `plugin_users-permissions_grant`
- In that row, find the `value` column (it's JSON)
- In this JSON, find the `instagram` attribute and edit it to add `"scope": ["user_profile"]` (⚠️ becareful to respect the JSON format)

```diff
...
  "instagram": {
    "enabled": true,
    "icon": "instagram",
    "key": "1234",
    "secret": "abcd",
    "callback": "https://myfrontend.com/connect/instagram/redirect",
-   "redirectUri": "http://mybackend.com/connect/instagram/callback"
+   "redirectUri": "http://mybackend.com/connect/instagram/callback",
+   "scope": ["user_profile"]
  },
...
```

- Save it

#### For mongoDB:

- In your database, find the collection `core_store`
- In that collection, find the document with the key `plugin_users-permissions_grant`
- In that document, find the `value` field (it's JSON)
- In this JSON, find the `instagram` attribute and edit it to add `"scope": ["user_profile"]` (⚠️ becareful to respect the JSON format)

```diff
...
  "instagram": {
    "enabled": true,
    "icon": "instagram",
    "key": "1234",
    "secret": "abcd",
    "callback": "https://myfrontend.com/connect/instagram/redirect",
-   "redirectUri": "http://mybackend.com/connect/instagram/callback"
+   "redirectUri": "http://mybackend.com/connect/instagram/callback",
+   "scope": ["user_profile"]
  },
...
```

- Save it



🎉 Congrats, your application has been migrated!
