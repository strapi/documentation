---
title: Fields for Content Types - Strapi User Guide
description: Instructions to configure in the Content-Types Builder the fields that compose each content-type.
sidebarDepth: 3
---

# Configuring fields for content types

::: warning The Content-Types Builder is only accessible to create and update content-types when your Strapi application is in a development environment, else it will be in a read-only mode in other environments.
<br>
:::

Content-types are composed of one or several fields. Each field is designed to contain specific kind of data, filled up in the Content Manager (see [Writing content](/user-docs/latest/content-manager/writing-content.md)).

In the Content-Types Builder, fields can be added at the creation of a new content-type or component, or afterward when a content-type or component is edited or updated. The following documentation lists all existing regular fields but also tackles the specificities of components and dynamic zones. For each, you will find a definition, explanation of the form they take once in the Content Manager, and instructions to configure them.

::: tip NOTE
Depending on what content-type or component is being created or edited, not all fields -including components and dynamic zones- are always available.
:::

![Select a field](../assets/content-types-builder/fields-selection.png)

## Regular fields

### <img width="28" src="../assets/content-types-builder/field-icon_text.png"> Text

The Text field displays a textbox that can contain small text. This field can be used for titles, descriptions, etc.

:::: tabs

::: tab Base settings

| Setting name | Instructions                                                                                            |
|--------------|---------------------------------------------------------------------------------------------------------|
| Name         | Write the name of the Text field.                                                                       |
| Type         | Choose between *Short text* and *Long text*, to allow more or less space to fill up the Text field.     |

:::

::: tab Advanced settings

| Setting name   | Instructions                                                                  |
|----------------|-------------------------------------------------------------------------------|
| Default value  | Write the default value of the Text field.                                    |
| RegExp pattern | Write a regular expression to make sure the value of the Text field matches a specific format. |
| Private field  | Tick to make the field private and prevent it from being found via the API.   |
| Enable localization for this field | (if the [Internationalization plugin](/user-docs/latest/plugins/strapi-plugins.md#internationalization-plugin) is installed and localization is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.    |
| Unique field   | Tick to prevent another field to be identical to this one.                    |
| Maximum length | Tick to define a maximum number of characters allowed.                        |
| Minimum length | Tick to define a minimum number of characters allowed.                        |


:::

::::

### <img width="28" src="../assets/content-types-builder/field-icon_richtext.png"> Rich Text

The Rich Text field displays an editor with formatting options to manage rich text. This field can be used for long written content.

:::: tabs

::: tab Base settings

| Setting name | Instructions                           |
|--------------|----------------------------------------|
| Name         | Write the name of the Rich Text field. |

:::

::: tab Advanced settings

| Setting name   | Instructions                                                                |
|----------------|-----------------------------------------------------------------------------|
| Default value  | Write the default value of the Rich Text field.                             |
| Private field  | Tick to make the field private and prevent it from being found via the API. |
| Enable localization for this field | (if the [Internationalization plugin](/user-docs/latest/plugins/strapi-plugins.md#internationalization-plugin) is installed and localization is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Maximum length | Tick to define a maximum number of characters allowed.                      |
| Minimum length | Tick to define a minimum number of characters allowed.                      |

:::

::::

### <img width="28" src="../assets/content-types-builder/field-icon_number.png"> Number

The Number field displays a field for any kind of number: integer, decimal and float.

:::: tabs

::: tab Base settings

| Setting name  | Instructions                                                    |
|---------------|-----------------------------------------------------------------|
| Name          | Write the name of the Number field.                             |
| Number format | Choose between *integer*, *big integer*, *decimal* and *float*. |

:::

::: tab Advanced settings

| Setting name   | Instructions                                                                |
|----------------|-----------------------------------------------------------------------------|
| Default value  | Write the default value of the Number field.                                |
| Private field  | Tick to make the field private and prevent it from being found via the API. |
| Enable localization for this field | (if the [Internationalization plugin](/user-docs/latest/plugins/strapi-plugins.md#internationalization-plugin) is installed and localization is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Unique field   | Tick to prevent another field to be identical to this one.                  |
| Maximum length | Tick to define a maximum number of characters allowed.                      |
| Minimum length | Tick to define a minimum number of characters allowed.                      |

:::

::::

### <img width="28" src="../assets/content-types-builder/field-icon_date.png"> Date

The Date field can display a date (year, month, day), time (hour, minute, second) or datetime (year, month, day, hour, minute, and second) picker.

:::: tabs

::: tab Base settings

| Setting name  | Instructions                                                    |
|---------------|-----------------------------------------------------------------|
| Name          | Write the name of the Date field.                               |
| Type          | Choose between *date*, *datetime* and *time*                    |

:::

::: tab Advanced settings

| Setting name   | Instructions                                                                |
|----------------|-----------------------------------------------------------------------------|
| Default value  | Write the default value of the Date field.                                  |
| Private field  | Tick to make the field private and prevent it from being found via the API. |
| Enable localization for this field | (if the [Internationalization plugin](/user-docs/latest/plugins/strapi-plugins.md#internationalization-plugin) is installed and localization is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Unique field   | Tick to prevent another field to be identical to this one.                  |

:::

::::

### <img width="28" src="../assets/content-types-builder/field-icon_boolean.png"> Boolean

The Boolean field displays a toggle button to manage boolean values (e.g. Yes or No, 1 or 0, True or False).

:::: tabs

::: tab Base settings

| Setting name  | Instructions                                                    |
|---------------|-----------------------------------------------------------------|
| Name          | Write the name of the Boolean field.                            |

:::

::: tab Advanced settings

| Setting name   | Instructions                                                                |
|----------------|-----------------------------------------------------------------------------|
| Default value  | Write the default value of the Boolean field.                               |
| Private field  | Tick to make the field private and prevent it from being found via the API. |
| Enable localization for this field | (if the [Internationalization plugin](/user-docs/latest/plugins/strapi-plugins.md#internationalization-plugin) is installed and localization is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Unique field   | Tick to prevent another field to be identical to this one.                  |

:::

::::

### <img width="28" src="../assets/content-types-builder/field-icon_relation.png"> Relation

The Relation field allows to establish a relation with another content-type, that must be a collection type.

There are 6 different types of relations:

- <img width="28" src="../assets/content-types-builder/icon_oneway.png"> One way: Content-type A *has one* Content-type B
- <img width="28" src="../assets/content-types-builder/icon_1to1.png"> One-to-one: Content-type A *has and belong to one* Content-type B
- <img width="28" src="../assets/content-types-builder/icon_1tomany.png"> One-to-many: Content-type A *belongs to many* Content-type B
- <img width="28" src="../assets/content-types-builder/icon_manyto1.png"> Many-to-one: Content-type B *has many* Content-type A
- <img width="28" src="../assets/content-types-builder/icon_manytomany.png"> Many-to-many: Content-type A *has and belongs to many* Content-type B
- <img width="28" src="../assets/content-types-builder/icon_manyway.png"> Many way: Content-type A *has many* Content-type B

:::: tabs

::: tab Base settings

Configuring the base settings of the Relation field consists in choosing with which existing content-type the relation should be established and the kind of relation. The edition window of the Relation field displays 2 grey boxes, each representing one of the content-types in relation. Between the grey boxes are displayed all possible relation types.

1. Click on the 2nd grey box to define the content-type B. It must be an already created collection type.
2. Click on the icon representing the relation to establish between the content-types.
3. Choose the *Field name* of the content-type A, meaning the name that will be used for the field in the content-type A.
4. (optional if disabled by the relation type) Choose the *Field name* of the content-type B.

:::

::: tab Advanced settings

| Setting name   | Instructions                                                                |
|----------------|-----------------------------------------------------------------------------|
| Private field  | Tick to make the field private and prevent it from being found via the API. |
| Unique field   | Tick to prevent another field to be identical to this one.                  |
| Custom column names | Rename the columns corresponding to the relational fields to make it more comprehensive in the database. |

:::

::::

### <img width="28" src="../assets/content-types-builder/field-icon_email.png"> Email

The Email field displays an email address field with format validation to ensure the email address is valid.

:::: tabs

::: tab Base settings

| Setting name  | Instructions                                                    |
|---------------|-----------------------------------------------------------------|
| Name          | Write the name of the Email field.                              |

:::

::: tab Advanced settings

| Setting name   | Instructions                                                                |
|----------------|-----------------------------------------------------------------------------|
| Default value  | Write the default value of the Email field.                                 |
| Private field  | Tick to make the field private and prevent it from being found via the API. |
| Enable localization for this field | (if the [Internationalization plugin](/user-docs/latest/plugins/strapi-plugins.md#internationalization-plugin) is installed and localization is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Unique field   | Tick to prevent another field to be identical to this one.                  |
| Maximum length | Tick to define a maximum number of characters allowed.                      |
| Minimum length | Tick to define a minimum number of characters allowed.                      |

:::

::::

### <img width="28" src="../assets/content-types-builder/field-icon_password.png"> Password

The Password field displays a password field that is encrypted.

:::: tabs

::: tab Base settings

| Setting name  | Instructions                                                    |
|---------------|-----------------------------------------------------------------|
| Name          | Write the name of the Password field.                           |

:::

::: tab Advanced settings

| Setting name   | Instructions                                                                |
|----------------|-----------------------------------------------------------------------------|
| Default value  | Write the default value of the Password field.                              |
| Private field  | Tick to make the field private and prevent it from being found via the API. |
| Enable localization for this field | (if the [Internationalization plugin](/user-docs/latest/plugins/strapi-plugins.md#internationalization-plugin) is installed and localization is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Unique field   | Tick to prevent another field to be identical to this one.                  |
| Maximum length | Tick to define a maximum number of characters allowed.                      |
| Minimum length | Tick to define a minimum number of characters allowed.                      |

:::

::::

### <img width="28" src="../assets/content-types-builder/field-icon_enum.png"> Enumeration

The Enumeration field allows to configure a list of values displayed in a drop-down list.

<!--- Add note about Enumeration fields known issues (i.e. recommending a relation using either oneWay or manyWay for some use-cases instead of enum) --->

:::: tabs

::: tab Base settings

| Setting name  | Instructions                                                    |
|---------------|-----------------------------------------------------------------|
| Name          | Write the name of the Enumeration field.                        |
| Values        | Write the values of the enumeration, one per line.              |

:::

::: tab Advanced settings

| Setting name   | Instructions                                                                |
|----------------|-----------------------------------------------------------------------------|
| Default value  | Write the default value of the Enumeration field.                           |
| Name override for GraphQL | Write a custom GraphQL schema type to override the default one for the field. |
| Private field  | Tick to make the field private and prevent it from being found via the API. |
| Enable localization for this field | (if the [Internationalization plugin](/user-docs/latest/plugins/strapi-plugins.md#internationalization-plugin) is installed and localization is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Unique field   | Tick to prevent another field to be identical to this one.                  |

:::

::::

### <img width="28" src="../assets/content-types-builder/field-icon_media.png"> Media

The Media field allows to choose one or more media files (e.g. image, video) from those uploaded in the Media Library of the application.

:::: tabs

::: tab Base settings

| Setting name  | Instructions                                                    |
|---------------|-----------------------------------------------------------------|
| Name          | Write the name of the Media field.                              |
| Type          | Choose between *Multiple media* to allow multiple media uploads, and *Single media* to only allow one media upload. |

:::

::: tab Advanced settings

| Setting name   | Instructions                                                                |
|----------------|-----------------------------------------------------------------------------|
| Private field  | Tick to make the field private and prevent it from being found via the API. |
| Enable localization for this field | (if the [Internationalization plugin](/user-docs/latest/plugins/strapi-plugins.md#internationalization-plugin) is installed and localization is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Unique field   | Tick to prevent another field to be identical to this one.                  |
| Select allowed types of media  | Click on the drop-down list to untick media types not allowed for this field. |

:::

::::

### <img width="28" src="../assets/content-types-builder/field-icon_json.png"> JSON

The JSON field allows to configure data in a JSON format, to store JSON objects or arrays.

:::: tabs

::: tab Base settings

| Setting name  | Instructions                                                    |
|---------------|-----------------------------------------------------------------|
| Name          | Write the name of the JSON field.                               |

:::

::: tab Advanced settings

| Setting name   | Instructions                                                                |
|----------------|-----------------------------------------------------------------------------|
| Private field  | Tick to make the field private and prevent it from being found via the API. |
| Enable localization for this field | (if the [Internationalization plugin](/user-docs/latest/plugins/strapi-plugins.md#internationalization-plugin) is installed and localization is enabled for the content-type) Allow the field to have a different value per locale. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Unique field   | Tick to prevent another field to be identical to this one.                  |
| Maximum length | Tick to define a maximum number of characters allowed.                      |
| Minimum length | Tick to define a minimum number of characters allowed.                      |

:::

::::

### <img width="28" src="../assets/content-types-builder/field-icon_uid.png"> UID

The UID field displays a field that sets a unique identifier, optionally based on an existing other field from the same content-type.

:::: tabs

::: tab Base settings

| Setting name   | Instructions                                                    |
|----------------|-----------------------------------------------------------------|
| Name           | Write the name of the UID field. It must not contain special characters or spaces.                     |
| Attached field | Choose what existing field to attach to the UID field. Choose *None* to not attach any specific field. |

:::

::: tab Advanced settings

| Setting name   | Instructions                                                                |
|----------------|-----------------------------------------------------------------------------|
| Default value  | Write the default value of the UID field.                                   |
| Private field  | Tick to make the field private and prevent it from being found via the API. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Maximum length | Tick to define a maximum number of characters allowed.                      |
| Minimum length | Tick to define a minimum number of characters allowed.                      |

:::

::::

## <img width="28" src="../assets/content-types-builder/icon_component.png"> Components

Components are a combination of several fields. Components allow to create reusable sets of fields, that can be quickly added to content-types, dynamic zones but also nested into other components.

When configuring a component through the Content-Types Builder, it is possible to either:

- create a new component by clicking on *Create a new component* (see [Creating a new component](/user-docs/latest/content-types-builder/creating-new-content-type.md#creating-a-new-component)),
- or use an existing one by clicking on *Use an existing component*.

:::: tabs

::: tab Base settings

| Setting name       | Instructions                                                    |
|--------------------|-----------------------------------------------------------------|
| Name               | Write the name of the component for the content-type.           |
| Select a component | When using an existing component only - Select from the drop-down list an existing component. |
| Type               | Choose between *Repeatable component* to be able to use several times the component for the content-type, or *Single component* to limit to only one time the use of the component. |

:::

::: tab Advanced settings

| Setting name   | Instructions                                                                            |
|----------------|-----------------------------------------------------------------------------------------|
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.              |
| Maximum value  | For repeatable components only - Tick to define a maximum number of characters allowed. |
| Minimum value  | For repeatable components only - Tick to define a minimum number of characters allowed. |
| Enable localization for this field | (if the [Internationalization plugin](/user-docs/latest/plugins/strapi-plugins.md#internationalization-plugin) is installed and localization is enabled for the content-type) Allow the component to be translated per available locale. |

:::

::::

## <img width="28" src="../assets/content-types-builder/icon_dynamiczone.png"> Dynamic zones

Dynamic zones are a combination of components that can be added to content-types. They allow a flexible content structure as once in the Content Manager, administrators have the choice of composing and rearranging the components of the dynamic zone how they want.

:::: tabs

::: tab Base settings

| Setting name       | Instructions                                                    |
|--------------------|-----------------------------------------------------------------|
| Name               | Write the name of the dynamic zone for the content-type.        |

:::

::: tab Advanced settings

| Setting name   | Instructions                                                                            |
|----------------|-----------------------------------------------------------------------------------------|
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.              |
| Maximum value  | Tick to define a maximum number of characters allowed.                                  |
| Minimum value  | Tick to define a minimum number of characters allowed.                                  |
| Enable localization for this field | (if the [Internationalization plugin](/user-docs/latest/plugins/strapi-plugins.md#internationalization-plugin) is installed and localization is enabled for the content-type) Allow the dynamic zone to be translated per available locale. |

:::

::::

After configuring the settings of the dynamic zone, its components must be configured as well. It is possible to either choose an existing component or create a new one.
