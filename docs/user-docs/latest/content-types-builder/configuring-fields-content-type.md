# Configuring fields for content types

Content types are composed of one or several fields. Each field is designed to contain specific kind of data, filled up in the Content Manager (see Writing content).

![Select a field](../assets/content-types-builder/fields-selection.png)

## Regular fields

### Text

The Text field displays a textbox that can contain small or longer text. This field can be used for titles, descriptions, etc.

:::: tabs

::: tab Base settings

| Setting name | Instructions                                                                                            |
|--------------|---------------------------------------------------------------------------------------------------------|
| Name         | Write the name of the Text field.                                                                       |
| Type         | Choose between *Short text* and *Long text*, to allow more or less space to fill up the Text field.     |

:::

::: tab Advanced settings

| Setting name   | Instructions                                                                |
|----------------|-----------------------------------------------------------------------------|
| Default value  | Write the default value of the Text field.                                  |
| RegExp pattern | Write a regular expression to format the Text field.                        |
| Private field  | Tick to make the field private and prevent it from being found via the API. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Unique field   | Tick to prevent another field to be identical to this one.                  |
| Maximum length | Tick to define a maximum number of characters allowed.                      |
| Minimum length | Tick to define a minimum number of characters allowed.                      |


:::

::::

### Rich Text

The Rich Text field displays an editor for rich text which contains formatting options.

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
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Maximum length | Tick to define a maximum number of characters allowed.                      |
| Minimum length | Tick to define a minimum number of characters allowed.                      |

:::

::::

### Number

The Number field displays a field for any kind of number: integers, decimals, floats etc.

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
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Unique field   | Tick to prevent another field to be identical to this one.                  |
| Maximum length | Tick to define a maximum number of characters allowed.                      |
| Minimum length | Tick to define a minimum number of characters allowed.                      |

:::

::::

### Date

The Date field can display a date, datetime or time picker. This field has the following level of granularity: year, month, day, hour, minute and second.

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
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Unique field   | Tick to prevent another field to be identical to this one.                  |

:::

::::

### Boolean

The Boolean field displays a toggle button for boolean values (e.g. Yes or No, 1 or 0, True or False).

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
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Unique field   | Tick to prevent another field to be identical to this one.                  |

:::

::::

### Relation

...

:::: tabs

::: tab Base settings

text

:::

::: tab Advanced settings

text

:::

:::: 

### Email

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
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Unique field   | Tick to prevent another field to be identical to this one.                  |
| Maximum length | Tick to define a maximum number of characters allowed.                      |
| Minimum length | Tick to define a minimum number of characters allowed.                      |

:::

::::

### Password

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
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Unique field   | Tick to prevent another field to be identical to this one.                  |
| Maximum length | Tick to define a maximum number of characters allowed.                      |
| Minimum length | Tick to define a minimum number of characters allowed.                      |

:::

::::

### Enumeration

The Enumeration field allows to configure a list of values displayed in a drop-down list.

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
| Name override for GraphQL  |                                                                 |
| Private field  | Tick to make the field private and prevent it from being found via the API. |
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Unique field   | Tick to prevent another field to be identical to this one.                  |

:::

::::

### Media

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
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Unique field   | Tick to prevent another field to be identical to this one.                  |
| Select allowed types of media  | Click on the drop-down list to untick media types not allowed for this field. |

:::

::::

### JSON

The JSON field allows to configure data in a JSON format.

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
| Required field | Tick to prevent creating or saving an entry if the field is not filled in.  |
| Unique field   | Tick to prevent another field to be identical to this one.                  |
| Maximum length | Tick to define a maximum number of characters allowed.                      |
| Minimum length | Tick to define a minimum number of characters allowed.                      |

:::

::::

### UID

The UID field displays a field that sets a unique identifier, optionally based on an existing other field from the same content type.

:::: tabs

::: tab Base settings

| Setting name   | Instructions                                                    |
|----------------|-----------------------------------------------------------------|
| Name           | Write the name of the UID field.                                |
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

## Components & Dynamic zones

...