---
title: Content-type Builder
description: Learn to use the Content-type Builder.
toc_max_heading_level: 5
tags:
- admin panel
- content type builder
---

import ScreenshotNumberReference from '/src/components/ScreenshotNumberReference.jsx';

# Content-type Builder

From the <Icon name="layout" /> Content-type Builder, accessible via the main navigation of the admin panel, users can create and edit their content types.

:::prerequisites Identity Card of the Content-type Builder
<Icon name="user"/> **Role & permission:** Minimum "Read" permission in Roles > Plugins - Content Type Builder. <br/>
<Icon name="laptop"/> **Environment:** Available in Development environment only.
:::

## Overview

<!-- Replace with Guideflow -->
<ThemedImage
  alt="Content-type Builder interface"
  sources={{
    light: '/img/assets/content-type-builder/content-types-builder.png',
    dark: '/img/assets/content-type-builder/content-types-builder_DARK.png',
  }}
/>

The <Icon name="layout" /> Content-type Builder allows the creation and management of content-types, which can be:

- Collection types: content-types that can manage several entries.
- Single types: content-types that can only manage one entry.
- Components: data structure that can be used in multiple collection types and single types. Although they are technically not proper content-types because they cannot exist independently, components are also created and managed through the Content-type Builder, in the same way as collection and single types.

All 3 are displayed as categories in the sub navigation of the <Icon name="layout" /> Content-type Builder. In each category are listed all content-types and components that have already been created.

:::tip
Click the search icon <Icon name="magnifying-glass" classes="ph-bold" /> in the <Icon name="layout" /> Content-type Builder sub navigation to find a specific collection type, single type, or component.
:::

## Usage

<br/>

### Creating content-types

<!-- MAY BE REMOVED - FEELS REDUNDANT WITH ID CARD

:::note Development-only
The Content-type Builder is only accessible to create and update content-types when your Strapi application is in a development environment, else it will be in a read-only mode in other environments.
:::
-->

The Content-type Builder allows to create new content-types: single and collection types, but also components.

#### New content-type

<ThemedImage
  alt="Content-type creation"
  sources={{
    light: '/img/assets/content-type-builder/content-type-creation.png',
    dark: '/img/assets/content-type-builder/content-type-creation_DARK.png',
  }}
/>

1. Choose whether you want to create a collection type or a single type.
2. In the <Icon name="layout" /> Content-type Builder's category of the content-type you want to create, click on **Create new collection/single type**.
3. In the content-type creation window, write the name of the new content-type in the *Display name* textbox.
4. Check the *API ID* to make sure the automatically pre-filled values are correct. Collection type names are indeed automatically pluralized when displayed in the Content Manager. It is recommended to opt for singular names, but the *API ID* field allows to fix any pluralization mistake.
5. (optional) In the Advanced Settings tab, configure the available settings for the new content-type:

      | Setting name    | Instructions                                                                                                                                     |
      |-----------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
      | Draft & publish | Tick the checkbox to allow entries of the content-type to be managed as draft versions, before they are published (see [Draft & Publish](/user-docs/features/draft-and-publish)). |
      | Internationalization | Tick the checkbox to allow entries of the content-type to be translated into other locales. |
<!--
| Review workflows | <EnterpriseBadge /> Tick the checkbox to allow entries of the content-type to be managed through defined review stages (see [Managing Review Workflows](/user-docs/settings/review-workflows)). |
-->
6. Click on the **Continue** button.
7. Add and configure chosen fields for your content-type (see [Configuring fields for content-types](#configuring-content-types-fields)).
8. Click on the **Save** button.

:::caution
New content-types are only considered created once they have been saved. Saving is only possible if at least one field has been added and properly configured. If these steps have not been done, a content-type cannot be created, listed in its category in the Content-type Builder, and cannot be used in the Content Manager.
:::

#### New component

<ThemedImage
  alt="Component creation"
  sources={{
    light: '/img/assets/content-type-builder/component-creation-1.png',
    dark: '/img/assets/content-type-builder/component-creation-1_DARK.png',
  }}
/>

1. In the Components category of the <Icon name="layout" /> Content-type Builder sub navigation, click on **Create new component**.
2. In the component creation window, configure the base settings of the new component:
   - Write the name of the component in the *Display name* textbox.
   - Select an available category, or enter in the textbox a new category name to create one.
   - _(optional)_ Choose an icon representing the new component. You can use the search <Icon name="magnifying-glass" classes="ph-bold" /> to find an icon instead of scrolling through the list.
3. Click on the **Continue** button.
4. Add and configure chosen fields for your component (see [Configuring fields for content-types](#configuring-content-types-fields)).
5. Click on the **Save** button.

### Editing content-types

The Content-type Builder allows to manage all existing content-types. For an chosen content-type or component to edit, the right side of the Content-type Builder interface displays all available editing and management options.

<ThemedImage
  alt="Content-type Builder's edition interface"
  sources={{
    light: '/img/assets/content-type-builder/content-types-builder_edition.png',
    dark: '/img/assets/content-type-builder/content-types-builder_edition_DARK.png',
  }}
/>

- Click on the **Add new/another field** button <ScreenshotNumberReference number="1" /> in the top right corner to add more fields to your content-type.
- In the table that displays the fields of your content-type <ScreenshotNumberReference number="2" />, click on the <Icon name="pencil-simple" /> and/or <Icon name="trash" /> buttons to respectively edit and/or delete these fields.
- Click on the <Icon name="pencil-simple" /> **Edit** button <ScreenshotNumberReference number="3" /> to access the basic and advanced settings of your content-type:

  <Tabs groupId="CTSettings">

  <TabItem value="CTBasicSettings" label="Basic settings">

  The **Basic Settings** tab allows to edit the following properties of the content-type or component:

  <ThemedImage
    alt="Content-type Builder's basic settings"
    sources={{
      light: '/img/assets/content-type-builder/basic-settings.png',
      dark: '/img/assets/content-type-builder/basic-settings_DARK.png',
    }}
  />

  * **Display name**: Name of the content-type or component as it will be displayed in the admin panel.
  * **API ID (singular)**: Name of the content-type or component as it will be used in the API. It is automatically generated from the display name, but can be edited.
  * **API ID (plural)**: Plural name of the content-type or component as it will be used in the API. It is automatically generated from the display name, but can be edited.
  * **Type**: Type of the content-type or component. It can be either a **Collection type** or a **Single type**.

  </TabItem>

  <TabItem value="CTAdvancedSettings" label="Advanced settings">

  The **Advanced Settings** tab allows to edit the following properties of the content-type or component:

  <ThemedImage
    alt="Content-type Builder's advanced settings"
    sources={{
      light: '/img/assets/content-type-builder/advanced-settings.png',
      dark: '/img/assets/content-type-builder/advanced-settings_DARK.png',
    }}
  />

  * **Draft & Publish**: Enable the [Draft & Publish](/user-docs/content-manager/saving-and-publishing-content) feature for the content-type or component. It is disabled by default.
  * **Internationalization**: Enable the [Internationalization](/user-docs/content-manager/translating-content) feature for the content-type or component. It is disabled by default.

  </TabItem>

  </Tabs>

- Click on the **Save** button <ScreenshotNumberReference number="4" /> to confirm any ongoing modification.

:::caution
Editing a field allows renaming it. However, keep in mind that regarding the database, renaming a field means creating a whole new field and deleting the former one. Although nothing is deleted from the database, the data that was associated with the former field name will not be accessible from the admin panel of your application anymore.
:::

### Configuring content-types fields

<!-- MAY BE REMOVED - FEELS REDUNDANT WITH ID CARD 

:::note Development-only
The Content-type Builder is only accessible to create and update content-types when your Strapi application is in a development environment, else it will be in a read-only mode in other environments.
:::
-->

Content-types are composed of one or several fields. Each field is designed to contain specific kind of data, filled up in the Content Manager (see [Writing content](/user-docs/content-manager/writing-content.md)).

In the <Icon name="layout" /> Content-type Builder, fields can be added at the creation of a new content-type or component, or afterward when a content-type or component is edited or updated.

:::note
Depending on what content-type or component is being created or edited, not all fields -including components and dynamic zones- are always available.
:::

<ThemedImage
  alt="Fields selection"
  sources={{
    light: '/img/assets/content-type-builder/fields-selection.png',
    dark: '/img/assets/content-type-builder/fields-selection_DARK.png',
  }}
/>

#### <img width="28" src="/img/assets/icons/v5/ctb_text.svg" /> Text {#text}

The Text field displays a textbox that can contain small text. This field can be used for titles, descriptions, etc.

<Tabs>

<TabItem value="base" label="Base settings">

| Setting name | Instructions                                                                                            |
|--------------|---------------------------------------------------------------------------------------------------------|
| Name         | Write the name of the Text field.                                                                       |
| Type         | Choose between *Short text* (255 characters maximum) and *Long text*, to allow more or less space to fill up the Text field.     |

</TabItem>

<TabItem value="advanced" label="Advanced settings">

| Setting name   | Instructions                                                                  |
|----------------|-------------------------------------------------------------------------------|
| Default value  | Write the default value of the Text field.                                    |
| RegExp pattern | Write a regular expression to make sure the value of the Text field matches a specific format. |
| Private field  | Tick to make the field private and prevent it from being found via the API.   |
| Enable localization for this field | (if [Internationalization](/user-docs/features/internationalization) is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.    |
| Unique field   | Tick to prevent another field to be identical to this one.                    |
| Maximum length | Tick to define a maximum number of characters allowed.                        |
| Minimum length | Tick to define a minimum number of characters allowed.                        |

</TabItem>

</Tabs>

#### <img width="28" src="/img/assets/icons/v5/ctb_richtextblocks.svg" /> Rich Text (Blocks) {#rich-text-blocks}

The Rich Text (Blocks) field displays an editor with live rendering and various options to manage rich text. This field can be used for long written content, even including images and code.

<Tabs>

<TabItem value="base" label="Base settings">

| Setting name | Instructions                                    |
|--------------|-------------------------------------------------|
| Name         | Write the name of the Rich Text (Blocks) field. |

</TabItem>

<TabItem value="advanced" label="Advanced settings">

| Setting name   | Instructions                                                                |
|----------------|-----------------------------------------------------------------------------|
| Private field  | Tick to make the field private and prevent it from being found via the API. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Enable localization for this field | (if [Internationalization](/user-docs/features/internationalization) is enabled for the content-type) Allow the field to have a different value per locale. |

</TabItem>

</Tabs>

:::strapi React renderer
If using the Blocks editor, we recommend that you also use the [Strapi Blocks React Renderer](https://github.com/strapi/blocks-react-renderer) to easily render the content in a React frontend.
:::

#### <img width="28" src="/img/assets/icons/v5/ctb_number.svg" /> Number {#number}

The Number field displays a field for any kind of number: integer, decimal and float.

<Tabs>

<TabItem value="base" label="Base settings">

| Setting name  | Instructions                                                    |
|---------------|-----------------------------------------------------------------|
| Name          | Write the name of the Number field.                             |
| Number format | Choose between *integer*, *big integer*, *decimal* and *float*. |

</TabItem>

<TabItem value="advanced" label="Advanced settings">

| Setting name   | Instructions                                                                |
|----------------|-----------------------------------------------------------------------------|
| Default value  | Write the default value of the Number field.                                |
| Private field  | Tick to make the field private and prevent it from being found via the API. |
| Enable localization for this field | (if [Internationalization](/user-docs/features/internationalization) is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Unique field   | Tick to prevent another field to be identical to this one.                  |
| Maximum value  | Tick to define a maximum value allowed.                      |
| Minimum value  | Tick to define a minimum value allowed.                      |

</TabItem>

</Tabs>

#### <img width="28" src="/img/assets/icons/v5/ctb_date.svg" /> Date {#date}

The Date field can display a date (year, month, day), time (hour, minute, second) or datetime (year, month, day, hour, minute, and second) picker.

<Tabs>

<TabItem value="base" label="Base settings">

| Setting name  | Instructions                                                    |
|---------------|-----------------------------------------------------------------|
| Name          | Write the name of the Date field.                               |
| Type          | Choose between *date*, *datetime* and *time*                    |

</TabItem>

<TabItem value="advanced" label="Advanced settings">

| Setting name   | Instructions                                                                |
|----------------|-----------------------------------------------------------------------------|
| Default value  | Write the default value of the Date field.                                  |
| Private field  | Tick to make the field private and prevent it from being found via the API. |
| Enable localization for this field | (if [Internationalization](/user-docs/features/internationalization) is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Unique field   | Tick to prevent another field to be identical to this one.                  |

</TabItem>

</Tabs>
 
#### <img width="28" src="/img/assets/icons/v5/ctb_password.svg" /> Password

The Password field displays a password field that is encrypted.

<Tabs>

<TabItem value="base" label="Base settings">

| Setting name  | Instructions                                                    |
|---------------|-----------------------------------------------------------------|
| Name          | Write the name of the Password field.                           |

</TabItem>

<TabItem value="advanced" label="Advanced settings">

| Setting name   | Instructions                                                                |
|----------------|-----------------------------------------------------------------------------|
| Default value  | Write the default value of the Password field.                              |
| Private field  | Tick to make the field private and prevent it from being found via the API. |
| Enable localization for this field | (if [Internationalization](/user-docs/features/internationalization) is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Maximum length | Tick to define a maximum number of characters allowed.                      |
| Minimum length | Tick to define a minimum number of characters allowed.                      |

</TabItem>

</Tabs>


#### <img width="28" src="/img/assets/icons/v5/ctb_media.svg" /> Media {#media}

The Media field allows to choose one or more media files (e.g. image, video) from those uploaded in the Media Library of the application.

<Tabs>

<TabItem value="base" label="Base settings">

| Setting name  | Instructions                                                    |
|---------------|-----------------------------------------------------------------|
| Name          | Write the name of the Media field.                              |
| Type          | Choose between *Multiple media* to allow multiple media uploads, and *Single media* to only allow one media upload. |

</TabItem>

<TabItem value="advanced" label="Advanced settings">

| Setting name   | Instructions                                                                |
|----------------|-----------------------------------------------------------------------------|
| Select allowed types of media  | Click on the drop-down list to untick media types not allowed for this field. |
| Private field  | Tick to make the field private and prevent it from being found via the API. |
| Enable localization for this field | (if [Internationalization](/user-docs/features/internationalization) is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Unique field   | Tick to prevent another field to be identical to this one.                  |

</TabItem>

</Tabs>

#### <img width="28" src="/img/assets/icons/v5/ctb_relation.svg" /> Relation {#relation}

The Relation field allows to establish a relation with another content-type, that must be a collection type.

There are 6 different types of relations:

- <img width="25" src="/img/assets/icons/v5/ctb_relation_oneway.svg" /> One way: Content-type A *has one* Content-type B
- <img width="25" src="/img/assets/icons/v5/ctb_relation_1to1.svg" /> One-to-one: Content-type A *has and belong to one* Content-type B
- <img width="25" src="/img/assets/icons/v5/ctb_relation_1tomany.svg" /> One-to-many: Content-type A *belongs to many* Content-type B
- <img width="25" src="/img/assets/icons/v5/ctb_relation_manyto1.svg" /> Many-to-one: Content-type B *has many* Content-type A
- <img width="25" src="/img/assets/icons/v5/ctb_relation_manytomany.svg" /> Many-to-many: Content-type A *has and belongs to many* Content-type B
- <img width="25" src="/img/assets/icons/v5/ctb_relation_manyway.svg" /> Many way: Content-type A *has many* Content-type B

<Tabs>

<TabItem value="base" label="Base settings">

Configuring the base settings of the Relation field consists in choosing with which existing content-type the relation should be established and the kind of relation. The edition window of the Relation field displays 2 grey boxes, each representing one of the content-types in relation. Between the grey boxes are displayed all possible relation types.

1. Click on the 2nd grey box to define the content-type B. It must be an already created collection type.
2. Click on the icon representing the relation to establish between the content-types.
3. Choose the *Field name* of the content-type A, meaning the name that will be used for the field in the content-type A.
4. (optional if disabled by the relation type) Choose the *Field name* of the content-type B.

</TabItem>

<TabItem value="advanced" label="Advanced settings">

| Setting name   | Instructions                                                                |
|----------------|-----------------------------------------------------------------------------|
| Private field  | Tick to make the field private and prevent it from being found via the API. |

</TabItem>

</Tabs>

#### <img width="28" src="/img/assets/icons/v5/ctb_boolean.svg" /> Boolean {#boolean}

The Boolean field displays a toggle button to manage boolean values (e.g. Yes or No, 1 or 0, True or False).

<Tabs>

<TabItem value="base" label="Base settings">

| Setting name  | Instructions                                                    |
|---------------|-----------------------------------------------------------------|
| Name          | Write the name of the Boolean field.                            |

</TabItem>

<TabItem value="advanced" label="Advanced settings">

| Setting name   | Instructions                                                                |
|----------------|-----------------------------------------------------------------------------|
| Default value  | Choose the default value of the Boolean field: *true*, *null* or *false*.   |
| Private field  | Tick to make the field private and prevent it from being found via the API. |
| Enable localization for this field | (if [Internationalization](/user-docs/features/internationalization) is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Unique field   | Tick to prevent another field to be identical to this one.                  |

</TabItem>

</Tabs>

#### <img width="28" src="/img/assets/icons/v5/ctb_json.svg" /> JSON {#json}

The JSON field allows to configure data in a JSON format, to store JSON objects or arrays.

<Tabs>

<TabItem value="base" label="Base settings">

| Setting name  | Instructions                                                    |
|---------------|-----------------------------------------------------------------|
| Name          | Write the name of the JSON field.                               |

</TabItem>

<TabItem value="advanced" label="Advanced settings">

| Setting name   | Instructions                                                                |
|----------------|-----------------------------------------------------------------------------|
| Private field  | Tick to make the field private and prevent it from being found via the API. |
| Enable localization for this field | (if [Internationalization](/user-docs/features/internationalization) is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |

</TabItem>

</Tabs>

#### <img width="28" src="/img/assets/icons/v5/ctb_email.svg" /> Email {#email}

The Email field displays an email address field with format validation to ensure the email address is valid.

<Tabs>

<TabItem value="base" label="Base settings">

| Setting name  | Instructions                                                    |
|---------------|-----------------------------------------------------------------|
| Name          | Write the name of the Email field.                              |

</TabItem>

<TabItem value="advanced" label="Advanced settings">

| Setting name   | Instructions                                                                |
|----------------|-----------------------------------------------------------------------------|
| Default value  | Write the default value of the Email field.                                 |
| Private field  | Tick to make the field private and prevent it from being found via the API. |
| Enable localization for this field | (if [Internationalization](/user-docs/features/internationalization) is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Unique field   | Tick to prevent another field to be identical to this one.                  |
| Maximum length | Tick to define a maximum number of characters allowed.                      |
| Minimum length | Tick to define a minimum number of characters allowed.                      |

</TabItem>

</Tabs>

#### <img width="28" src="/img/assets/icons/v5/ctb_password.svg" /> Password {#password}

The Password field displays a password field that is encrypted.

<Tabs>

<TabItem value="base" label="Base settings">

| Setting name  | Instructions                                                    |
|---------------|-----------------------------------------------------------------|
| Name          | Write the name of the Password field.                           |

</TabItem>

<TabItem value="advanced" label="Advanced settings">

| Setting name   | Instructions                                                                |
|----------------|-----------------------------------------------------------------------------|
| Default value  | Write the default value of the Password field.                              |
| Private field  | Tick to make the field private and prevent it from being found via the API. |
| Enable localization for this field | (if [Internationalization](/user-docs/features/internationalization) is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Maximum length | Tick to define a maximum number of characters allowed.                      |
| Minimum length | Tick to define a minimum number of characters allowed.                      |

</TabItem>

</Tabs>

#### <img width="28" src="/img/assets/icons/v5/ctb_enum.svg" /> Enumeration {#enum}

The Enumeration field allows to configure a list of values displayed in a drop-down list.

<!--- Add note about Enumeration fields known issues (i.e. recommending a relation using either oneWay or manyWay for some use-cases instead of enum) --->

<Tabs>

<TabItem value="base" label="Base settings">

| Setting name  | Instructions                                                    |
|---------------|-----------------------------------------------------------------|
| Name          | Write the name of the Enumeration field.                        |
| Values        | Write the values of the enumeration, one per line.              |

</TabItem>

<TabItem value="advanced" label="Advanced settings">

| Setting name   | Instructions                                                                |
|----------------|-----------------------------------------------------------------------------|
| Default value  | Choose the default value of the Enumeration field.                          |
| Name override for GraphQL | Write a custom GraphQL schema type to override the default one for the field. |
| Private field  | Tick to make the field private and prevent it from being found via the API. |
| Enable localization for this field | (if [Internationalization](/user-docs/features/internationalization) is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |

</TabItem>

</Tabs>

:::caution
Enumeration values should always have an alphabetical character preceding any number as it could otherwise cause the server to crash without notice when the GraphQL plugin is installed.
:::

#### <img width="28" src="/img/assets/icons/v5/ctb_uid.svg" /> UID {#uid}

The UID field displays a field that sets a unique identifier, optionally based on an existing other field from the same content-type.

<Tabs>

<TabItem value="base" label="Base settings">

| Setting name   | Instructions                                                    |
|----------------|-----------------------------------------------------------------|
| Name           | Write the name of the UID field. It must not contain special characters or spaces.                     |
| Attached field | Choose what existing field to attach to the UID field. Choose *None* to not attach any specific field. |

</TabItem>

<TabItem value="advanced" label="Advanced settings">

| Setting name   | Instructions                                                                |
|----------------|-----------------------------------------------------------------------------|
| Default value  | Write the default value of the UID field.                                   |
| Private field  | Tick to make the field private and prevent it from being found via the API. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Maximum length | Tick to define a maximum number of characters allowed.                      |
| Minimum length | Tick to define a minimum number of characters allowed.                      |

</TabItem>

</Tabs>

:::tip
The UID field can be used to create a slug based on the Attached field.
:::

#### <img width="28" src="/img/assets/icons/v5/ctb_richtext.svg" /> Rich Text (Markdown) {#rich-text-markdown}

The Rich Text (Markdown) field displays an editor with basic formatting options to manage rich text written in Markdown. This field can be used for long written content.

<Tabs>

<TabItem value="base" label="Base settings">

| Setting name | Instructions                                      |
|--------------|---------------------------------------------------|
| Name         | Write the name of the Rich Text (Markdown) field. |

</TabItem>

<TabItem value="advanced" label="Advanced settings">

| Setting name   | Instructions                                                                |
|----------------|-----------------------------------------------------------------------------|
| Default value  | Write the default value of the Rich Text field.                             |
| Private field  | Tick to make the field private and prevent it from being found via the API. |
| Enable localization for this field | (if [Internationalization plugin](/user-docs/features/internationalization) is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Maximum length | Tick to define a maximum number of characters allowed.                      |
| Minimum length | Tick to define a minimum number of characters allowed.                      |

</TabItem>

</Tabs>

#### <img width="28" src="/img/assets/icons/v5/ctb_component.svg" /> Components {#components}

Components are a combination of several fields. Components allow to create reusable sets of fields, that can be quickly added to content-types, dynamic zones but also nested into other components.

When configuring a component through the Content-type Builder, it is possible to either:

- create a new component by clicking on *Create a new component* (see [Creating a new component](#new-component)),
- or use an existing one by clicking on *Use an existing component*.

<Tabs>

<TabItem value="base" label="Base settings">

| Setting name       | Instructions                                                    |
|--------------------|-----------------------------------------------------------------|
| Name               | Write the name of the component for the content-type.           |
| Select a component | When using an existing component only - Select from the drop-down list an existing component. |
| Type               | Choose between *Repeatable component* to be able to use several times the component for the content-type, or *Single component* to limit to only one time the use of the component. |

</TabItem>

<TabItem value="advanced" label="Advanced settings">

| Setting name   | Instructions                                                                            |
|----------------|-----------------------------------------------------------------------------------------|
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.              |
| Private field  | Tick to make the field private and prevent it from being found via the API.             |
| Maximum value  | For repeatable components only - Tick to define a maximum number of characters allowed. |
| Minimum value  | For repeatable components only - Tick to define a minimum number of characters allowed. |
| Enable localization for this field | (if [Internationalization](/user-docs/features/internationalization) is enabled for the content-type) Allow the component to be translated per available locale. |

</TabItem>

</Tabs>

#### <img width="28" src="/img/assets/icons/v5/ctb_dz.svg" /> Dynamic zones {#dynamiczones}

Dynamic zones are a combination of components that can be added to content-types. They allow a flexible content structure as once in the Content Manager, administrators have the choice of composing and rearranging the components of the dynamic zone how they want.

<Tabs>

<TabItem value="base" label="Base settings">

| Setting name       | Instructions                                                    |
|--------------------|-----------------------------------------------------------------|
| Name               | Write the name of the dynamic zone for the content-type.        |

</TabItem>

<TabItem value="advanced" label="Advanced settings">

| Setting name   | Instructions                                                                            |
|----------------|-----------------------------------------------------------------------------------------|
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.              |
| Maximum value  | Tick to define a maximum number of characters allowed.                                  |
| Minimum value  | Tick to define a minimum number of characters allowed.                                  |
| Enable localization for this field | (if [Internationalization](/user-docs/features/internationalization) is enabled for the content-type) Allow the dynamic zone to be translated per available locale. |

</TabItem>

</Tabs>

After configuring the settings of the dynamic zone, its components must be configured as well. It is possible to either choose an existing component or create a new one.

:::caution
When using dynamic zones, different components cannot have the same field name with different types (or with enumeration fields, different values).
:::

#### Custom fields

Custom fields are a way to extend Strapi’s capabilities by adding new types of fields to content-types or components. Once installed (see [Marketplace](/user-docs/plugins/installing-plugins-via-marketplace.md) documentation), custom fields are listed in the _Custom_ tab when selecting a field for a content-type.

Each custom field type can have basic and advanced settings. The [Marketplace](https://market.strapi.io/plugins?categories=Custom+fields) lists available custom fields, and hosts dedicated documentation for each custom field, including specific settings.

### Deleting content-types

Content types and components can be deleted through the Content-type Builder. Deleting a content-type automatically deletes all entries from the Content Manager that were based on that content-type. The same goes for the deletion of a component, which is automatically deleted from every content-type or entry where it was used.

1. In the <Icon name="layout" /> Content-type Builder sub navigation, click on the name of the content-type or component to delete.
2. In the edition interface of the chosen content-type or component, click on the <Icon name="pencil-simple" /> **Edit** button on the right side of the content-type's or component's name.
3. In the edition window, click on the **Delete** button.
4. In the confirmation window, confirm the deletion.

:::caution
Deleting a content-type only deletes what was created and available from the Content-type Builder, and by extent from the admin panel of your Strapi application. All the data that was created based on that content-type is however kept in the database. For more information, please refer to the related [GitHub issue](https://github.com/strapi/strapi/issues/1114).
:::
