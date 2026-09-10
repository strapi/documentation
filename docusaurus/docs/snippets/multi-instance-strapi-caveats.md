:::danger
Strapi runs its schema synchronization on startup, once per process, with no lock shared between instances. A restart that leaves the content-types unchanged is safe, because the synchronization detects an unchanged schema and does nothing. 2 other cases are not safe: a release that changes content-types, and a release with pending migrations. Instances starting together then issue concurrent schema changes and migrations against the same database.

For those releases, start or roll a single instance first and let it finish booting before the next one starts. This is a property of running several processes against one database, so spreading the instances across separate hosts does not avoid it.
:::

:::caution
[CRON jobs](/cms/configurations/cron) are scheduled inside each Strapi process, so a job runs once per instance rather than once overall. A task set to run nightly runs as many times as you have instances. If your project sets `cron.enabled` to `true`, either move the jobs out of Strapi or keep them on a single instance.
:::

2 more consequences are worth knowing:

- Anything Strapi holds in memory belongs to one instance only, because each instance is a separate process. Nothing in Strapi core replicates state between them.
- The default local upload provider writes files to the instance's own disk. Instances sharing a machine and a project directory share that disk, but instances on different machines or in different containers do not, so use one of the [Media Library providers](/cms/configurations/media-library-providers) backed by object storage in that case.
