:::caution
In most cases you should not use the Query Engine API and rather use the [Document Service API](/cms/api/document-service).

Only use the Query Engine API if you exactly know what you are doing, for instance if you want to use a lower-level API that directly interacts with unique rows of the database.

Please keep in mind that the Query Engine API is not aware of the most advanced Strapi 5 features like Draft & Publish, Internationalization, Content History, and possibly more.
This also means that the Query Engine API will not be able to use `documentId` and will use `id`, which means it could lead to unattended consequences at the database level or partial or incomplete compatibility with Strapi 5 features. 
:::
