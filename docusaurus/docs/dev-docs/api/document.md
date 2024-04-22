---
title: Documents
description: Learn what a Document is in Strapi v5
displayed_sidebar: devDocsSidebar
pagination_prev: dev-docs/api/content-api
tags:
- API
- concepts
- Content API
- Document Service API
- Draft & Publish
- Internationalization (i18n)
- introduction
---

# Documents

A document in Strapi 5 contains all the variations of a unique piece of content.

A single type contains a unique document, and a collection type can contain several documents.

Depending on which features are enabled for the content-type, such as [Internationalization (i18n)](/user-docs/content-manager/translating-content) and [Draft & Publish](/user-docs/content-manager/saving-and-publishing-content), a document can have multiple variations, and the values of the document's fields can be different for each of these variations:

<Tabs>
<TabItem value="document-only" label="Neither i18n nor Draft & Publish enabled">

![](/img/assets/apis/document.png)

</TabItem>

<TabItem value="dandp-only" label="Only Draft & Publish enabled">

![](/img/assets/apis/document-d_and_p-only.png)

</TabItem>

<TabItem value="i18n-only" label="Only i18n enabled">

![](/img/assets/apis/document-i18n-only.png)

</TabItem>

<TabItem value="i18n-and-dandp" label="i18n + Draft & Publish enabled" default>

![](/img/assets/apis/document-i18n-d_and_p.png)

</TabItem>
</Tabs>

- If the Internationalization (i18n) feature is enabled on the content-type, a document can have multiple **document locales**.
- If the Draft & Publish feature is enabled on the content-type, a document can have a **published** and a **draft** version.
- A document, being a unique entry of a content-type, can include multiple **fields**.

<details>
<summary>Example with FoodAdvisor:</summary>

[FoodAdvisor](https://github.com/strapi/foodadvisor), Strapi's official demo application, is a website listing restaurants around the world. FoodAdvisor's content includes multiple content-types:

- The "Homepage" is a single type, so there's only one document for the homepage.
- "Restaurants" is a collection type, and each restaurant (i.e., each item from the collection type) is represented as a document in Strapi 5.
- The "Biscotte Restaurant" is one of the documents from the "Restaurants" collection type.<br/>Internationalization and Draft & Publish are both enabled for the "Biscotte Restaurant" content-type, so the document can include all of the following variations:
  - The "Biscotte Restaurant" has 3 document locales:
    - one for English,
    - one for French,
    - and one for Spanish.
  - Each of the document locales of the "Biscotte Restaurant" document can have:
    - a published version that can be seen on the website,
    - and a draft version with updates not ready to be published yet.
- The "Biscotte Restaurant" is a document from the "Restaurants" collection type, and like all documents from the same collection type, it includes multiple fields, such as the name of the restaurant, a short description, and opening hours.

</details>

:::strapi APIs to query documents data
To interact with documents or the data they represent:

  - From the back-end server (for instance, from controllers, services, and the back-end part of plugins), use the [Document Service API](/dev-docs/api/document-service).
  - From the front-end part of your application, query your data using the [REST API](/dev-docs/api/rest) or the [GraphQL API](/dev-docs/api/graphql).

For additional information about the APIs, please refer to the [Content API introduction](/dev-docs/api/content-api).
:::

:::info Default version in returned results
An important difference between the back-end and front-end APIs is about the default version returned when no parameter is passed:
- The Document Service API returns the draft version by default,
- while REST and GraphQL APIs return the published version by default.
:::
