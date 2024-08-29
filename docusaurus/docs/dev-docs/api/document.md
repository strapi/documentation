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

<div className="document-concept-page">

A **document** in Strapi 5 is an API-only concept. A document represents all the different variations of content for a given entry of a content-type.

A single type contains a unique document, and a collection type can contain several documents.

When you use the admin panel, the concept of a document is never mentioned and not necessary for the end user. Users create and edit **entries** in the [Content Manager](/user-docs/content-manager). For instance, as a user, you either list the entries for a given locale, or edit the draft version of a specific entry in a given locale.

However, at the API level, the value of the fields of an entry can actually have:

- different content for the English and the French locale,
- and even different content for the draft and published version in each locale.

The bucket that includes the content of all the draft and published versions for all the locales is a document.

Manipulating documents with the [Document Service API](/dev-docs/api/document-service) will help you create, retrieve, update, and delete documents or a specific subset of the data they contain.

The following diagrams represent all the possible variations of content depending on which features, such as [Internationalization (i18n)](/user-docs/content-manager/translating-content) and [Draft & Publish](/user-docs/content-manager/saving-and-publishing-content), are enabled for a content-type:

<Tabs>
<TabItem value="document-only" label="Neither i18n nor Draft & Publish enabled">

```mermaid
flowchart LR
stX("Single type X <br>(e.g., homepage)")
docX("Document X<br/>(e.g., the homepage)")
docA(Document A)
docB(Document B)
docC("Document C<br>(e.g., a restaurant,<br/>'Biscotte Restaurant')")
ctA(Collection type A)
ctB("Collection type B<br>(e.g., restaurants)")
fieldA(Field A)
fieldB(Field B)
fieldC("Field C<br>(e.g., 'name')")

content --- stX --- docX
content --- ctA
content --- ctB

ctB --- docA
ctB --- docB
ctB --- docC

docC --- fieldA
docC --- fieldB
docC --- fieldC

classDef notHighlighted fill:transparent,stroke:none
classDef highlighted fill:transparent,stroke:#8D5AF3,stroke-width:2px
class content,stX,docX,docA,docB,ctA,ctB,docLocA,docLocB,docLocC,draftA,draftB,draftC,pubA,pubB,pubC,fieldA,fieldB,fieldC notHighlighted
linkStyle default stroke:#8D5AF3
class docC highlighted
```

</TabItem>

<TabItem value="dandp-only" label="Only Draft & Publish enabled">

```mermaid
flowchart LR
stX("Single type X <br>(e.g., homepage)")
docX("Document X<br/>(e.g., the homepage)")
docA(Document A)
docB(Document B)
docC("Document C<br>(e.g., a restaurant,<br/>'Biscotte Restaurant')")
draftC(Draft Version)
pubC(Published Version)
ctA(Collection type A)
ctB("Collection type B<br>(e.g., restaurants)")
fieldA(Field A)
fieldB(Field B)
fieldC("Field C<br>(e.g., 'name')")

content --- stX --- docX
content --- ctA
content --- ctB

ctB --- docA
ctB --- docB
ctB --- docC

docC --- draftC
docC --- pubC

pubC --- fieldA
pubC --- fieldB
pubC --- fieldC

classDef notHighlighted fill:transparent,stroke:none
classDef highlighted fill:transparent,stroke:#8D5AF3,stroke-width:2px
class content,stX,docX,docA,docB,ctA,ctB,docLocA,docLocB,docLocC,draftA,draftB,draftC,pubA,pubB,pubC,fieldA,fieldB,fieldC notHighlighted
linkStyle default stroke:#8D5AF3
class docC highlighted
```

</TabItem>

<TabItem value="i18n-only" label="Only i18n enabled">

```mermaid
flowchart LR
stX("Single type X <br>(e.g., homepage)")
docX("Document X<br/>(e.g., the homepage)")
docA(Document A)
docB(Document B)
docC("Document C<br>(e.g., a restaurant,<br/>'Biscotte Restaurant')")
docLocA("Document Locale A<br>(e.g., 'en')")
docLocB("Document Locale B<br><br>")
docLocC(Document Locale C)
ctA(Collection type A)
ctB("Collection type B<br>(e.g., restaurants)")
fieldA(Field A)
fieldB(Field B)
fieldC("Field C<br>(e.g., 'name')")

content --- stX --- docX
content --- ctA
content --- ctB

ctB --- docA
ctB --- docB
ctB --- docC

docC --- docLocA
docC --- docLocB
docC --- docLocC

docLocC --- fieldA
docLocC --- fieldB
docLocC --- fieldC

classDef notHighlighted fill:transparent,stroke:none
classDef highlighted fill:transparent,stroke:#8D5AF3,stroke-width:2px
class content,stX,docX,docA,docB,ctA,ctB,docLocA,docLocB,docLocC,fieldA,fieldB,fieldC notHighlighted
linkStyle default stroke:#8D5AF3
class docC highlighted
```

</TabItem>

<TabItem value="i18n-and-dandp" label="i18n + Draft & Publish enabled" default>

```mermaid
flowchart LR
stX("Single type X <br>(e.g., homepage)")
docX("Document X<br/>(e.g., the homepage)")
docA(Document A)
docB(Document B)
docC("Document C<br>(e.g., a restaurant,<br/>'Biscotte Restaurant')")
docLocA("Document Locale A<br>(e.g., 'en')")
docLocB(Document Locale B)
docLocC(Document Locale C)
draftA(Draft Version)
draftB(Draft Version)
draftC(Draft Version)
pubA(Published Version)
pubC(Published Version)
ctA(Collection type A)
ctB("Collection type B<br>(e.g., restaurants)")
fieldA(Field A)
fieldB(Field B)
fieldC("Field C<br>(e.g., 'name')")

content --- stX --- docX
content --- ctA
content --- ctB

ctB --- docA
ctB --- docB
ctB --- docC

docC --- docLocA
docC --- docLocB --- draftB
docC --- docLocC

docLocA --- draftA
docLocA --- pubA

docLocC --- draftC
docLocC --- pubC

pubC --- fieldA
pubC --- fieldB
pubC --- fieldC

classDef notHighlighted fill:transparent,stroke:none
classDef highlighted fill:transparent,stroke:#8D5AF3,stroke-width:2px
class content,stX,docX,docA,docB,ctA,ctB,docLocA,docLocB,docLocC,draftA,draftB,draftC,pubA,pubB,pubC,fieldA,fieldB,fieldC notHighlighted
linkStyle default stroke:#8D5AF3
class docC highlighted
```

</TabItem>
</Tabs>

- If the Internationalization (i18n) feature is enabled on the content-type, a document can have multiple **document locales**.
- If the Draft & Publish feature is enabled on the content-type, a document can have a **published** and a **draft** version.

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

</div>
