---
sidebar_position: 2
tags:
- collection type
- components
- Content-type
- Content-type Builder
- single type
---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# Creating content-types

:::note Development-only
The Content-type Builder is only accessible to create and update content-types when your Strapi application is in a development environment, else it will be in a read-only mode in other environments.
:::

The Content-type Builder allows to create new content-types: single and collection types. Although they are not proper content-types as they cannot exist independently, components can also be created through the Content-type Builder, in the same way as collection and single types.

## Creating a new content-type

<ThemedImage
  alt="Content-type creation"
  sources={{
    light: '/img/assets/content-type-builder/content-type-creation.png',
    dark: '/img/assets/content-type-builder/content-type-creation_DARK.png',
  }}
/>

Content types are created from the Content-type Builder's Collection types and Single types categories, both displayed in the Content-type Builder sub navigation.

To create a new content-type:

1. Choose whether you want to create a collection type or a single type.
2. In the category of the content-type you want to create, click on **Create new collection/single type**.
3. In the content-type creation window, write the name of the new content-type in the *Display name* textbox.
4. Check the *API ID* to make sure the automatically pre-filled values are correct. Collection type names are indeed automatically pluralized when displayed in the Content Manager. It is recommended to opt for singular names, but the *API ID* field allows to fix any pluralization mistake.
5. (optional) In the Advanced Settings tab, configure the available settings for the new content-type:

      | Setting name    | Instructions                                                                                                                                     |
      |-----------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
      | Draft & publish | Tick the checkbox to allow entries of the content-type to be managed as draft versions, before they are published (see [Saving & publishing content](/user-docs/content-manager/saving-and-publishing-content#saving-publishing-content)). |
      | Internationalization | Tick the checkbox to allow entries of the content-type to be translated into other locales. |

<!--
| Review workflows | <EnterpriseBadge /> Tick the checkbox to allow entries of the content-type to be managed through defined review stages (see [Managing Review Workflows](/user-docs/settings/review-workflows)). |
-->

6. Click on the **Continue** button.
7. Add and configure chosen fields for your content-type (see [Configuring fields for content-types](/user-docs/content-type-builder/configuring-fields-content-type)).
8. Click on the **Save** button.

:::caution
New content-types are only considered created once they have been saved. Saving is only possible if at least one field has been added and properly configured. If these steps have not been done, a content-type cannot be created, listed in its category in the Content-type Builder, and cannot be used in the Content Manager.
:::

## Creating a new component

<ThemedImage
  alt="Component creation"
  sources={{
    light: '/img/assets/content-type-builder/component-creation-1.png',
    dark: '/img/assets/content-type-builder/component-creation-1_DARK.png',
  }}
/>

Components are created from the same-named category of the Content-type Builder's sub navigation.

To create a new component:

1. In the Components category of the Content-type Builder sub navigation, click on **Create new component**.
2. In the component creation window, configure the base settings of the new component:
   - Write the name of the component in the *Display name* textbox.
   - Select an available category, or enter in the textbox a new category name to create one.
   - _(optional)_ Choose an icon representing the new component. You can use the search ![Search icon](/img/assets/icons/v5/Search.svg) to find an icon instead of scrolling through the list.
3. Click on the **Continue** button.
4. Add and configure chosen fields for your component (see [Configuring fields for content-types](/user-docs/content-type-builder/configuring-fields-content-type)).
5. Click on the **Save** button.
