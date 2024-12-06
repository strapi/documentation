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
import YesPlugins from '/docs/snippets/breaking-change-affecting-plugins.md'
import NoCodemods from '/docs/snippets/breaking-change-not-handled-by-codemod.md'

# The GraphQL API has been updated

In Strapi 5, the GraphQL API has been updated. It handles the new, flattened response format (see [related breaking change](/dev-docs/migration/v4-to-v5/breaking-changes/new-response-format.md)), and can also now accept [Relay-style](https://www.apollographql.com/docs/technotes/TN0029-relay-style-connections/) queries.

<Intro />

<YesPlugins />
<NoCodemods />

## List of changes

| Topic                        |  Description of the changes |
|------------------------------|-----------------------------------------------------------------------------------------------------|
| File upload support          | <ul><li>Removed `uploadFile` `uploadFiles` mutations</li><li>Removed `updateFileInfo` mutation in favor of using the `updateUploadFile` mutation</li><li>Removed `removeFile` mutation in favor of using the `deleteUploadFile` mutation</li><li>Removed `folder` queries & mutations</li><li>Removed `createUploadFile` mutation</li></ul> |
| Internationalization support | Removed the `createXXLocalization` mutations in favor of being able to update any locale from the main `updateXXX` mutation |
| Draft & Publish support      | Removed `publicationState` in favor of `status` to align with the new Draft & Publish behavior |
| Schema changes               | <ul><li>Simplified the basic queries with no `meta`/`pagination`</li><li>Introduced `Connection` to add pagination</li></ul> |

For an extensive description of the new Strapi 5 GraphQL API, please refer to the [GraphQL API](/dev-docs/api/graphql) reference documentation.

## Migration

To gradually convert to the new GraphQL API format, follow these steps:

1. Enable v4 compatibility mode with the `v4ComptabilityMode` flag in the configuration of the GraphQL plugin (see [plugins configuration](/dev-docs/configurations/plugins#graphql)):

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

2. Use `documentId` instead of `id` for contentType queries & mutations:

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
      meta {
        pagination {
          page
          pageSize
        }
      }
    }
  }
  ```

  ```graphql
  {
    mutation {
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
  }
  ```

3. Move to `_connection` without changing response format (only applies to queries):

  ```graphql
  {
    # collection fields can be renamed to _connection to get a v4 compat response
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
          # collection fields can be renamed to _connection to get a v4 compat response
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
          # collection fields can be renamed to _connection to get a v4 compat response
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

4. Remove attributes (applies to queries & mutation responses):

  ```graphql
  {
    # collection fields can be renamed to _connection to get a v4 compat response
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
        # collection fields can be renamed to _connection to get a v4 compat response
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
        # collection fields can be renamed to _connection to get a v4 compat response
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

5. Use new naming or the simpler queries:

  ```graphql
  {
    # Rename data to nodes & meta.pagination to pageInfo
    restaurants_connection {
      nodes {
        id
        title
        # can remove data in single Images 
        image {
          id
          url
        }
        # collection fields can be renamed to _connection to get a v4 compat response
        images_connection {
          nodes {
            id
            url
          }
        }
        # can remove data in xToOne 
        xToOneRelation {
          id
          field
        }
        # collection fields can be renamed to _connection to get a v4 compat response
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
    # remove _connection & data if you don't need pagination att all
    restaurants {
      id
      title
      image {
        id
        url
      }
      # remove _connection & data
      images {
        id
        url	
      }
      xToOneRelation {
        id
        field
      }
      # remove _connection & data
      xToManyRelation {
        id
        field
      }
    }
  }
  ```
