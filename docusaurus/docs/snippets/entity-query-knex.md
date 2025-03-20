Strapi v4 offers several layers to interact with the backend and build your queries:

* The Document Service API is the recommended API to interact with your application's database. The Document Service is the layer that handles Strapi's document model and the complex content structures like components and dynamic zones, which the lower-level layers are not aware of.
* The Query Engine API interacts with the database layer at a lower level and is used under the hood to execute database queries. It gives unrestricted internal access to the database layer, but should be used only if the Document Service API does not cover your use case.
* If you need direct access to `knex` functions, use `strapi.db.connection`.
