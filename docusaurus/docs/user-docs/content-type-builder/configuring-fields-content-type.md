---
description: Content-types are composed of one or several fields. Each field is designed to contain specific kind of data, filled up in the Content Manager.
sidebar_position: 3
tags:
- collection type
- components
- Content Manager
- Content-type
- Content-type Builder
- dynamic zones
- single type
- password
---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# Configuring fields for content-types

:::note Development-only
The Content-type Builder is only accessible to create and update content-types when your Strapi application is in a development environment, else it will be in a read-only mode in other environments.
:::

Content-types are composed of one or several fields. Each field is designed to contain specific kind of data, filled up in the Content Manager (see [Writing content](/user-docs/content-manager/writing-content.md)).

In the Content-type Builder, fields can be added at the creation of a new content-type or component, or afterward when a content-type or component is edited or updated. The following documentation lists all existing regular fields but also tackles the specificities of components and dynamic zones. For each, you will find a definition, explanation of the form they take once in the Content Manager, and instructions to configure them.

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

## Regular fields

### <img width="28" src="/img/assets/icons/v5/ctb_text.svg" /> Text

The Text field displays a textbox that can contain small text. This field can be used for titles, descriptions, etc.

<Tabs>

<TabItem value="base" label="Base settings">

| Setting name | Instructions                                                                                            |
|--------------|---------------------------------------------------------------------------------------------------------|
| Name         | Write the name of the Text field.                                                                       |
| Type         | Choose between *Short text* and *Long text*, to allow more or less space to fill up the Text field.     |

</TabItem>

<TabItem value="advanced" label="Advanced settings">

| Setting name   | Instructions                                                                  |
|----------------|-------------------------------------------------------------------------------|
| Default value  | Write the default value of the Text field.                                    |
| RegExp pattern | Write a regular expression to make sure the value of the Text field matches a specific format. |
| Private field  | Tick to make the field private and prevent it from being found via the API.   |
| Enable localization for this field | (if [Internationalization](/user-docs/plugins/strapi-plugins#-internationalization-plugin) is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.    |
| Unique field   | Tick to prevent another field to be identical to this one.                    |
| Maximum length | Tick to define a maximum number of characters allowed.                        |
| Minimum length | Tick to define a minimum number of characters allowed.                        |

</TabItem>

</Tabs>

### <img width="28" src="/img/assets/icons/v5/ctb_richtextblocks.svg" /> Rich Text (Blocks)

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
| Enable localization for this field | (if [Internationalization](/user-docs/plugins/strapi-plugins#-internationalization-plugin) is enabled for the content-type) Allow the field to have a different value per locale. |

</TabItem>

</Tabs>

:::strapi React renderer
If using the Blocks editor, we recommend that you also use the [Strapi Blocks React Renderer](https://github.com/strapi/blocks-react-renderer) to easily render the content in a React frontend.
:::

### <img width="28" src="/img/assets/icons/v5/ctb_number.svg" /> Number

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
| Enable localization for this field | (if [Internationalization](/user-docs/plugins/strapi-plugins#-internationalization-plugin) is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Unique field   | Tick to prevent another field to be identical to this one.                  |
| Maximum value  | Tick to define a maximum value allowed.                      |
| Minimum value  | Tick to define a minimum value allowed.                      |

</TabItem>

</Tabs>

### <img width="28" src="/img/assets/icons/v5/ctb_date.svg" /> Date

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
| Enable localization for this field | (if [Internationalization](/user-docs/plugins/strapi-plugins#-internationalization-plugin) is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Unique field   | Tick to prevent another field to be identical to this one.                  |

</TabItem>

</Tabs>
 


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
| Enable localization for this field | (if [Internationalization](/user-docs/plugins/strapi-plugins#-internationalization-plugin) is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Maximum length | Tick to define a maximum number of characters allowed.                      |
| Minimum length | Tick to define a minimum number of characters allowed.                      |

</TabItem>

</Tabs>


### <img width="28" src="/img/assets/icons/v5/ctb_media.svg" /> Media

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
| Enable localization for this field | (if [Internationalization](/user-docs/plugins/strapi-plugins#-internationalization-plugin) is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Unique field   | Tick to prevent another field to be identical to this one.                  |

</TabItem>

</Tabs>

### <img width="28" src="/img/assets/icons/v5/ctb_relation.svg" /> Relation

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

### <img width="28" src="/img/assets/icons/v5/ctb_boolean.svg" /> Boolean

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
| Enable localization for this field | (if [Internationalization plugin](/user-docs/plugins/strapi-plugins#-internationalization-plugin) is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Unique field   | Tick to prevent another field to be identical to this one.                  |

</TabItem>

</Tabs>

### <img width="28" src="/img/assets/icons/v5/ctb_json.svg" /> JSON

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
| Enable localization for this field | (if [Internationalization plugin](/user-docs/plugins/strapi-plugins#-internationalization-plugin) is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |

</TabItem>

</Tabs>

### <img width="28" src="/img/assets/icons/v5/ctb_email.svg" /> Email

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
| Enable localization for this field | (if [Internationalization plugin](/user-docs/plugins/strapi-plugins#-internationalization-plugin) is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Unique field   | Tick to prevent another field to be identical to this one.                  |
| Maximum length | Tick to define a maximum number of characters allowed.                      |
| Minimum length | Tick to define a minimum number of characters allowed.                      |

</TabItem>

</Tabs>

### <img width="28" src="/img/assets/icons/v5/ctb_password.svg" /> Password

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
| Enable localization for this field | (if [Internationalization plugin](/user-docs/plugins/strapi-plugins#-internationalization-plugin) is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Maximum length | Tick to define a maximum number of characters allowed.                      |
| Minimum length | Tick to define a minimum number of characters allowed.                      |

</TabItem>

</Tabs>

### <img width="28" src="/img/assets/icons/v5/ctb_enum.svg" /> Enumeration

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
| Enable localization for this field | (if [Internationalization plugin](/user-docs/plugins/strapi-plugins#-internationalization-plugin) is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |

</TabItem>

</Tabs>

:::caution
Since Strapi v4.1.3, enumeration values should always have an alphabetical character preceding any number as it could otherwise cause the server to crash without notice when the GraphQL plugin is installed.
:::

### <img width="28" src="/img/assets/icons/v5/ctb_uid.svg" /> UID

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

### <img width="28" src="/img/assets/icons/v5/ctb_richtext.svg" /> Rich Text (Markdown)

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
| Enable localization for this field | (if [Internationalization plugin](/user-docs/plugins/strapi-plugins#-internationalization-plugin) is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Maximum length | Tick to define a maximum number of characters allowed.                      |
| Minimum length | Tick to define a minimum number of characters allowed.                      |

</TabItem>

</Tabs>

## Custom fields

Custom fields are a way to extend Strapi’s capabilities by adding new types of fields to content-types or components. Once installed (see [Marketplace](/user-docs/plugins/installing-plugins-via-marketplace.md) documentation), custom fields are listed in the _Custom_ tab when selecting a field for a content-type.

Each custom field type can have basic and advanced settings. The [Marketplace](https://market.strapi.io/plugins?categories=Custom+fields) lists available custom fields, and hosts dedicated documentation for each custom field, including specific settings.

## <img width="28" src="/img/assets/icons/v5/ctb_component.svg" /> Components

Components are a combination of several fields. Components allow to create reusable sets of fields, that can be quickly added to content-types, dynamic zones but also nested into other components.

When configuring a component through the Content-type Builder, it is possible to either:

- create a new component by clicking on *Create a new component* (see [Creating a new component](/user-docs/content-type-builder/creating-new-content-type#creating-a-new-component)),
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
| Enable localization for this field | (if [Internationalization plugin](/user-docs/plugins/strapi-plugins#-internationalization-plugin) is enabled for the content-type) Allow the component to be translated per available locale. |

</TabItem>

</Tabs>

## <img width="28" src="/img/assets/icons/v5/ctb_dz.svg" /> Dynamic zones

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
| Enable localization for this field | (if [Internationalization plugin](/user-docs/plugins/strapi-plugins#-internationalization-plugin) is enabled for the content-type) Allow the dynamic zone to be translated per available locale. |

</TabItem>

</Tabs>

After configuring the settings of the dynamic zone, its components must be configured as well. It is possible to either choose an existing component or create a new one.

:::caution
When using dynamic zones, different components cannot have the same field name with different types (or with enumeration fields, different values).
:::
