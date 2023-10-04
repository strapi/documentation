---
title: Migrate from 4.5.1+ to 4.6.1 - Strapi Developer Docs
description: Learn how you can migrate your Strapi application from 4.5.1+ to 4.6.1.
displayed_sidebar: devDocsSidebar
---

import BuildCommand from '/docs/snippets/build-npm-yarn.md'
import DevelopCommand from '/docs/snippets/develop-npm-yarn.md'

# v4.5.1+ to v4.6.1 migration guide

The Strapi v4.5.1+ to v4.6.1 migration guide upgrades v4.5.1+ to v4.6.1. We introduced a configuration for webhooks to receive populated relations. Also, this migration guide is needed for all users who were limiting media size for the local upload provider.

The migration guide consists of:

- Upgrading the application dependencies
- Changing the webhooks configuration (optional)
- Updating the local upload provider `sizeLimit`
- Reinitializing the application

## Upgrading the application dependencies to 4.6.1

:::prerequisites
Stop the server before starting the upgrade.
:::

1. Upgrade all of the Strapi packages in `package.json` to `4.6.1`:

   ```json title="package.json"

   {
     // ...
     "dependencies": {
       "@strapi/strapi": "4.6.1",
       "@strapi/plugin-users-permissions": "4.6.1",
       "@strapi/plugin-i18n": "4.6.1"
       // ...
     }
   }
   ```

2. Save the edited `package.json` file.

3. Run either `yarn` or `npm install` to install the new version.

:::tip
If the operation doesn't work, try removing your `yarn.lock` or `package-lock.json`. If that doesn't help, remove the `node_modules` folder as well and try again.
:::

## Migrate Audit Log Tables (optional & EE only)

:::caution
This specific section only applies to Strapi Enterprise customers or Cloud customers who have the Audit Logs feature enabled.
:::

If you updated to v4.6.0 originally and are now updating to v4.6.1 while being a Strapi Enterprise customer, there was a small breaking change with the table names for Audit Logs. This is only relevant if you are using the Audit Logs feature.

Between v4.6.0 and v4.6.1 the Audit log table names changed from `audit_logs` to `strapi_audit_logs` and likewise the link table changed from `audit_logs_user_links` to `strapi_audit_logs_user_links`.

To migrate these tables properly without losing your audit log data:

1. Make a backup of the database in case something unexpected happens.
2. In the `./database/migrations` folder, create a file named: `2023.02.08T00.00.00.update-audit-logs-tables.js`.
3. Copy and paste the following code into the previously created file:

```js
const tables = {
  auditLogs: {
    fq: ["audit_logs_created_by_id_fk", "audit_logs_updated_by_id_fk"],
    indexes: ["audit_logs_created_by_id_fk", "audit_logs_updated_by_id_fk"],
    tableOld: "audit_logs",
    tableNew: "strapi_audit_logs",
  },
  auditLogsUser: {
    fq: ["audit_logs_user_links_fk", "audit_logs_user_links_inv_fk"],
    indexes: ["audit_logs_user_links_fk", "audit_logs_user_links_inv_fk"],
    tableOld: "audit_logs_user_links",
    tableNew: "strapi_audit_logs_user_links",
  },
};

module.exports = {
  async up(knex) {
    // Drop all of the schema entries we cache
    await knex.from("strapi_database_schema").delete();

    // Rename the auditLog table
    if (await knex.schema.hasTable(tables.auditLogs.tableOld)) {
      await knex.schema.renameTable(
        tables.auditLogs.tableOld,
        tables.auditLogs.tableNew
      );
    }

    // Rename the auditLogUser table
    if (await knex.schema.hasTable(tables.auditLogsUser.tableOld)) {
      await knex.schema.renameTable(
        tables.auditLogsUser.tableOld,
        tables.auditLogsUser.tableNew
      );
    }

    try {
      // Drop the auditLog table fq and indexes
      for (const fq of tables.auditLogs.fq) {
        await knex.schema.alterTable(tables.auditLogs.tableNew, (table) => {
          table.dropForeign([], fq);
        });
      }

      for (const index of tables.auditLogs.indexes) {
        await knex.schema.alterTable(tables.auditLogs.tableNew, (table) => {
          table.dropIndex([], index);
        });
      }

      // Drop the auditLogUser table fq and indexes
      for (const fq of tables.auditLogsUser.fq) {
        await knex.schema.alterTable(tables.auditLogsUser.tableNew, (table) => {
          table.dropForeign([], fq);
        });
      }

      for (const index of tables.auditLogsUser.indexes) {
        await knex.schema.alterTable(tables.auditLogsUser.tableNew, (table) => {
          table.dropIndex([], index);
        });
      }
    } catch (e) {
      console.log(e);
    }
  },
};
```

5. Save the file.

## Changing the webhooks configuration (optional)

By default, and for backward compatibility reasons, webhooks will receive the entity with its relations populated again. We do recommend to disable this behavior if you were not using it, as it may cause performance issues when having many relations. If you need populated relations in your webhook, we recommend doing a separate query in your webhook listener to fetch the entity only with the necessary data.

If you want to change this behavior, you can do so by editing the `./config/server.js` file (or `./config/server.ts` if you are using TypeScript) and add the following configuration:

```jsx
'use strict';

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: 'http://localhost:1337',
  webhooks: {
    // Add this to not receive populated relations in webhooks
    populateRelations: false,
  },
});
```

With this, you will no longer receive populated relations in webhooks, and **response times on the Content Manager will be shorter**.

You can see more of the available configuration options in the [server configuration documentation](/dev-docs/configurations/server).

## Updating the sizeLimit provider configuration

This step is only required if you were using the [`sizeLimit` configuration](/dev-docs/plugins/upload#max-file-size) for your upload provider.

:::caution
The documentation required the `sizeLimit` to be in bytes, but it was actually in kilobytes. This is now fixed, and the limit will be interpreted as bytes.

If you, for some reason, were limiting the file size to kilobytes, you should update the value to be in bytes.
:::

We recommend to move the `sizeLimit` outside the provider options like the following, as it will be deprecated in the next major version.

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js title="./config/plugins.js"

module.exports = {
  // ...
  upload: {
    config: {
      sizeLimit: 250 * 1024 * 1024, // Now
      providerOptions: {
        sizeLimit: 250 * 1024 * 1024 // Before
      }
    }
  }
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```js title="./config/plugins.ts"

export default {
  // ...
  upload: {
    config: {
      sizeLimit: 250 * 1024 * 1024, // Now
      providerOptions: {
        sizeLimit: 250 * 1024 * 1024 // Before
      }
    }
  }
};
```

</TabItem>

</Tabs>

To change the script:

1. In the `./config/plugins.js` file, identify the upload configuration if you have one.
2. (_optional_) If you have a `sizeLimit`, move it one level above `providerOptions`.

## Rebuild the application

<BuildCommand components={props.components} />

## Restart the application

<DevelopCommand components={props.components} />
