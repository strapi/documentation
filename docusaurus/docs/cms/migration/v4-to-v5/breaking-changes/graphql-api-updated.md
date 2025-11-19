---
title: The GraphQL API has been updated
description: In Strapi 5, the GraphQL API has been updated. It handles the new, flattened response format, and can also now accept Relay-style queries.
sidebar_label: GraphQL API updated
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - content API
 - GraphQL
 - upgrade to Strapi 5
---

import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# The GraphQL API has been updated

In Strapi 5, the GraphQL API has been updated. It handles the new, flattened response format (see [related breaking change](/cms/migration/v4-to-v5/breaking-changes/new-response-format.md)), and can also now accept <ExternalLink to="https://www.apollographql.com/docs/technotes/TN0029-relay-style-connections/" text="Relay-style"/> queries.

Flat queries still return a simple array of documents. You can also use Relay-style `*_connection` queries, which return `nodes` and a `pageInfo` object to handle pagination. Use these when you need metadata about pages or total counts.

<Intro />
<BreakingChangeIdCard plugins />

## List of changes

| Topic                        |  Description of the changes |
|------------------------------|-----------------------------------------------------------------------------------------------------|
| File upload support          | <ul><li>Removed `uploadFile` `uploadFiles` mutations</li><li>Removed `updateFileInfo` mutation in favor of using the `updateUploadFile` mutation</li><li>Removed `removeFile` mutation in favor of using the `deleteUploadFile` mutation</li><li>Removed `folder` queries & mutations</li><li>Removed `createUploadFile` mutation</li></ul> |
| Internationalization support | Removed the `createXXLocalization` mutations in favor of being able to update any locale from the main `updateXXX` mutation |
| Draft & Publish support      | Removed `publicationState` in favor of `status` to align with the new Draft & Publish behavior |
| Schema changes               | <ul><li>Simplified the basic queries with no `meta`/`pagination`</li><li>Introduced `Connection` to add pagination</li></ul> |

For an extensive description of the new Strapi 5 GraphQL API, please refer to the [GraphQL API](/cms/api/graphql) reference documentation.

## Migration

To gradually convert to the new GraphQL API format, follow these steps:

1. Enable the `v4CompatibilityMode` retro-compatibility header so queries can continue to rely on `data.attributes.*` while you refactor clients. Configure it in `config/plugins.{js,ts}`. With the flag on, the server keeps returning the Strapi v4 shape.

   ```js title="config/plugins.js"
   module.exports = {
     graphql: {
       config: {
         v4CompatibilityMode: true,
       },
     },
   };
   ```

   ```graphql
   {
     restaurants {
       data {
         id
         attributes {
           title
           image {
             data {
               id
               attributes {
                 url
               }
             }
           }
           images {
             data {
               id
               attributes {
                 url
               }
             }
           }
           xToOneRelation {
             data {
               id
               attributes {
                 field
               }
             }
           }
           xToManyRelation {
             data {
               id
               attributes {
                 field
               }
             }
           }
         }
       }
       meta {
         pagination {
           page
           pageSize
         }
       }
     }
   }
   ```

2. Adopt [`documentId`](/cms/migration/v4-to-v5/breaking-changes/use-document-id) which replaces numeric `id` in GraphQL. Update queries and mutations to read and send `documentId`, even while compatibility mode is on.

   ```graphql
   {
     restaurants {
       data {
         documentId
         attributes {
           title
           image {
             data {
               documentId
               attributes {
                 url
               }
             }
           }
           images {
             data {
               documentId
               attributes {
                 url
               }
             }
           }
           xToOneRelation {
             data {
               documentId
               attributes {
                 field
               }
             }
           }
           xToManyRelation {
             data {
               documentId
               attributes {
                 field
               }
             }
           }
         }
       }
     }
   }
   ```

   ```graphql
   mutation UpdateRestaurant {
     updateRestaurant(
       documentId: "some-doc-id",
       data: { title: "My great restaurant" }
     ) {
       data {
         documentId
         attributes {
           title
           image {
             data {
               documentId
               attributes {
                 url
               }
             }
           }
         }
       }
     }
   }
   ```

3. Rename collection fields with their `_connection` variants. This unlocks Relay pagination metadata while still keeping the v4-style `data` and `attributes` shape.

   ```graphql
   {
     restaurants_connection {
       data {
         id
         attributes {
           title
           image {
             data {
               id
               attributes {
                 url
               }
             }
           }
           images_connection {
             data {
               id
               attributes {
                 url
               }
             }
           }
           xToOneRelation {
             data {
               id
               attributes {
                 field
               }
             }
           }
           xToManyRelation_connection {
             data {
               id
               attributes {
                 field
               }
             }
           }
         }
       }
       meta {
         pagination {
           page
           pageSize
         }
       }
     }
   }
   ```

4. Once collection and single queries use `*_connection`, stop wrapping user fields in `attributes`. This applies to queries and mutation responses.

   ```graphql
   {
     restaurants_connection {
       data {
         id
         title
         image {
           data {
             id
             url
           }
         }
         images_connection {
           data {
             id
             url
           }
         }
         xToOneRelation {
           data {
             id
             field
           }
         }
         xToManyRelation_connection {
           data {
             id
             field
           }
         }
       }
       meta {
         pagination {
           page
           pageSize
         }
       }
     }
   }
   ```

5. *(Optional)* If you need Relay-compliant pagination, rename `data` to `nodes` and `meta.pagination` to `pageInfo`. When a client does not need pagination metadata, you can also drop `_connection` entirely.

   ```graphql
   {
     restaurants_connection {
       nodes {
         id
         title
         image {
           id
           url
         }
         images_connection {
           nodes {
             id
             url
           }
         }
         xToOneRelation {
           id
           field
         }
         xToManyRelation_connection {
           nodes {
             id
             field
           }
         }
       }
       pageInfo {
         page
         pageSize
       }
     }
   }
   ```

   ```graphql
   {
     restaurants {
       id
       title
       image {
         id
         url
       }
       images {
         id
         url
       }
       xToOneRelation {
         id
         field
       }
       xToManyRelation {
         id
         field
       }
     }
   }
   ```

6. Disable the `v4CompatibilityMode` compatibility header so the server emits the Strapi 5 format natively.
