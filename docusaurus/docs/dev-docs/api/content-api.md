---
title: Content API
description: Learn more about Strapi 5's Content API
displayed_sidebar: devDocsSidebar
pagination_prev: dev-docs/setup-deployment
pagination_next: dev-docs/advanced-features
tags:
- concepts
- Document Service API
- GraphQL
- GraphQL API
- introduction
- Query Engine API
- Rest API
---

# Strapi APIs to access your content

Once you've created and configured a Strapi project, created a data structure with the [Content-Type Builder](/user-docs/content-type-builder) and started adding data through the [Content Manager](/user-docs/content-manager), you likely would like to access your content.

From a front-end application, your content can be accessed through Strapi's Content API, which is exposed:
- by default through the [REST API](/dev-docs/api/rest)
- and also through the [GraphQL API](/dev-docs/api/graphql) if you installed the Strapi built-in [GraphQL plugin](/dev-docs/plugins/graphql).

REST and GraphQL APIs represent the top-level layers of the Content API exposed to external applications. Strapi also provides 2 lower-level APIs:

- The [Document Service API](/dev-docs/api/document-service) is the recommended API to interact with your application's database within the [backend server](/dev-docs/customization) or through [plugins](/dev-docs/plugins). The Document Service is the layer that handles **documents** <DocumentDefinition /> as well as Strapi's complex data structures like components and dynamic zones.
- The Query Engine API interacts with the database layer at a lower level and is used under the hood to execute database queries. It gives unrestricted internal access to the database layer, but is not aware of any advanced Strapi features that Strapi 5 can handle, like Draft & Publish, Internationalization, Content History, and more.<br/>⚠️ In most, if not all, use cases, you should use the Document Service API instead.

<ThemedImage
alt="Content APIs diagram"
sources={{
  light: '/img/assets/diagrams/apis.png',
  dark: '/img/assets/diagrams/apis_DARK.png'
}}
/>

<br/>

This documentation section includes reference information about the following Strapi APIs and some integration guides with 3rd party technologies:

<CustomDocCardsWrapper>

<CustomDocCard emoji="↕️" title="REST API" description="Query the Content API from a front-end application through REST." link="/dev-docs/api/rest" />

<CustomDocCard emoji="↕️" title="GraphQL API" description="Query the Content API  from a front-end application through GraphQL." link="/dev-docs/api/graphql" />

<CustomDocCard emoji="🔃" title="Document Service API" description="Query your data through the backend server or plugins." link="/dev-docs/api/document-service" />

:::strapi Integrations
If you're looking for how to integrate Strapi with other platforms, please refer to Strapi's [integrations pages](https://strapi.io/integrations).
:::

</CustomDocCardsWrapper>
