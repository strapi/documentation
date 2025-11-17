---
title: Content API
description: Learn more about Strapi 5's Content API
displayed_sidebar: cmsSidebar
sidebar_label: APIs Introduction
pagination_prev: cms/setup-deployment
pagination_next: cms/api/document
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

Once you've created and configured a Strapi project, created a content structure with the [Content-Type Builder](/cms/features/content-type-builder) and started adding data through the [Content Manager](/cms/features/content-manager), you likely would like to access your content.

From a front-end application, your content can be accessed through Strapi's Content API, which is exposed:

- by default through the [REST API](/cms/api/rest)
- and also through the [GraphQL API](/cms/api/graphql) if you installed the Strapi built-in [GraphQL plugin](/cms/plugins/graphql).

You can also use the [Strapi Client](/cms/api/client) library to interact with the REST API.

REST and GraphQL APIs represent the top-level layers of the Content API exposed to external applications. Strapi also provides 2 lower-level APIs:

- The [Document Service API](/cms/api/document-service), accessible through `strapi.documents`, is the recommended API to interact with your application's database within the [backend server](/cms/customization) or through [plugins](/cms/plugins-development/developing-plugins). The Document Service is the layer that handles **documents** <DocumentDefinition /> as well as Strapi's complex content structures like components and dynamic zones.
- The [Query Engine API](/cms/api/query-engine), accessible through `db.query` (i.e., `strapi.db.query`), interacts with the database layer at a lower level and is used under the hood to execute database queries. It gives unrestricted internal access to the database layer, but is not aware of any advanced Strapi features that Strapi 5 can handle, like Draft & Publish, Internationalization, Content History, and more.<br/>⚠️ In most, if not all, use cases, you should use the Document Service API instead.

<ThemedImage
alt="Content APIs diagram"
sources={{
  light: '/img/assets/diagrams/apis-v2.png',
  dark: '/img/assets/diagrams/apis-v2_DARK.png'
}}
/>

<br/>

This documentation section includes reference information about the following Strapi APIs and some integration guides with 3rd party technologies:

<CustomDocCardsWrapper>

<CustomDocCard emoji="↕️" title="REST API" description="Query the Content API from a front-end application through REST." link="/cms/api/rest" />

<CustomDocCard emoji="↕️" title="GraphQL API" description="Query the Content API  from a front-end application through GraphQL." link="/cms/api/graphql" />

<CustomDocCard emoji="↕️" title="Strapi Client" description="Interact with the REST API through the Strapi Client library." link="/cms/api/client" />

<CustomDocCard emoji="🔃" title="Document Service API" description="Query your data through the backend server or plugins." link="/cms/api/document-service" />

<CustomDocCard emoji="📋" title="OpenAPI Specification" description="Generate OpenAPI specifications for your Strapi applications." link="/cms/api/openapi" />

:::strapi Integrations
If you're looking for how to integrate Strapi with other platforms, such as Next.js integration, Vue.js integration, Svelte.js integration, and more, please refer to Strapi's <ExternalLink to="https://strapi.io/integrations" text="integrations pages"/>.
:::

</CustomDocCardsWrapper>
