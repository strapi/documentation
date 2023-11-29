---
title: Documents
description: Learn what a Document is in Strapi v5
displayed_sidebar: devDocsSidebar
---

# Documents

A document in Strapi v5 contains all the variations of a unique piece of content.

![](/img/assets/apis/document.png)

- A document can have a `published` version and a `draft` **version**.
- Each published or draft version of a document can have multiple **document locales**.<br/>A document locale includes all the content of a given document version for a specific locale.
- A document locale can include multiple **fields**.

**Example:** 

[FoodAdvisor](https://github.com/strapi/foodadvisor), Strapi's official demo application, is a website listing restaurants around the world. FoodAdvisor's content includes multiple content-types:

- The homepage is a single type. A single type includes a unique document.
- "Restaurants" is a collection type, and each restaurant is represented as a document in Strapi v5.
- The "Biscotte Restaurant" is a document, and this document can include all of the following content variations:
  - The "Biscotte Restaurant" document has 2 different versions, a published version that can be seen on the website, and a draft version with updates not ready to be published yet.
  - The published version of the "Biscotte Restaurant" document has 3 document locales: one for English, one for French, and one for Spanish.
  - Each document locale of the "Biscotte Restaurant" document includes multiple fields, such as the name of the restaurant, a short description, and opening hours.

| Element         | Example scope: This includes… |
|-----------------|---------------------------------------|
| Collection type | All the content from all the documents of the `Restaurants` collection type |
| Document        | All the content from all the variations of the `Biscotte Restaurant` document, including all content from both its published and draft versions |
| Version         | All the content from the `published` version of the "Biscotte restaurant" document |
| Document locale | All the content for the `'en'` (i.e., English) locale of the published version of the "Biscotte Restaurant" document |
| Field           | The content of the `description` field for the 'en' locale of the published version of the "Biscotte Restaurant" document |
