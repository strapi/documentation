# Creating content-types

::: warning The Content-Types Builder is only accessible to create and update content-types when your Strapi application is in a development environment, else it will be in a read-only mode in other environments.
<br>
:::

The Content-Types Builder allows to create new content-types: single and collection types. Although they are not proper content-types as they cannot exist independently, components can also be created through the Content-Types Builder, in the same way as collection and single types.

## Creating a new content-type

![Content-type creation](../assets/content-types-builder/content-type-creation.png)

Content types are created from the Collection types and Single types categories of the Content-Types Builder.

To create a new content-type:

1. Choose whether you want to create a collection type or a single type.
2. Click on the **Create a new collection/single type** button in the category of the content-type you want to create.
3. In the content-type creation window, write the name of the new content-type in the *Display name* textbox. When creating a collection type, opt for a singular name, as collection type names are automatically pluralised when displayed in the Content Manager.
4. (optional) In the Advanced Settings tab, configure the available settings for the new content-type:

| Setting name    | Instructions                                                                                                                                     |
|-----------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| Draft & Publish | Click on **ON** to activate the Draft & Publish feature for your content-type (see [Saving & publishing content](/user-docs/latest/content-manager/saving-and-publishing-content.md#saving-publishing-content)). Click on **OFF** to deactivate the feature. |
| Collection name | Write a database collection/table name that will be used for your content-type.                                                                  |

5. Click on the **Continue** button.
6. Add and configure chosen fields for your content-type (see [Configuring fields for content-types](/user-docs/latest/content-types-builder/configuring-fields-content-type.md)).
7. Click on the **Save** button.

::: warning IMPORTANT
New content-types are only considered created once they have been saved. Saving is only possible if at least one field has been added and properly configured. If these steps have not been done, a content-type cannot be created, listed in its category in the Content-Types Builder, and cannot be used in the Content Manager.
:::

## Creating a new component

![Component creation](../assets/content-types-builder/component-creation.png)

Components are created from the same-named category of the Content-Types Builder.

To create a new component:

1. Click on the **Create a new component** button.
2. In the component creation window, configure the base settings of the new component:
   - Write the name of the component in the *Name* textbox.
   - Select an available category, or enter in the textbox a new category name to create one.
   - Choose an icon to represent the new component.
3. Click on the **Continue** button.
4. Add and configure chosen fields for your component (see [Configuring fields for content-types](/user-docs/latest/content-types-builder/configuring-fields-content-type.md)).
5. Click on the **Save** button.
