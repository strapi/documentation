:::strapi Different types of middlewares

In Strapi, 3 middleware concepts coexist:

- **Global middlewares** are [configured and enabled](/dev-docs/configurations/middlewares) for the entire Strapi server application. These middlewares can be applied at the application level or at the API level. <br/>The present documentation describes how to implement them.<br/>Plugins can also add global middlewares (see [Server API documentation](/dev-docs/plugins/server-api)).

- **Route middlewares** have a more limited scope and are configured and used as middlewares at the route level. They are described in the [routes documentation](/dev-docs/backend-customization/routes#middlewares).

- **Document Service middlewares** apply to the Document Service API and have their own [implementation](/dev-docs/api/document-service/middlewares) and related [lifecycle hooks](/dev-docs/migration/v4-to-v5/breaking-changes/lifecycle-hooks-document-service#table).

:::
