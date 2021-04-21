---
title: Upload - Strapi Developer Documentation
description: Upload any kind of file on your server or external providers.
---

# Upload

Thanks to the plugin `Upload`, you can upload any kind of file on your server or external providers such as **AWS S3**.

## Configuration

Currently the Strapi middleware in charge of parsing requests needs to be configured to support file sizes larger than the default of **200MB**.

The library we use is [`koa-body`](https://github.com/dlau/koa-body), and it uses the [`node-formidable`](https://github.com/felixge/node-formidable) library to process files.

You can pass configuration to the middleware directly by setting it in the `parser` middleware configuration in `config/middleware.js`:

```js
module.exports = {
  //...
  settings: {
    parser: {
      enabled: true,
      multipart: true,
      formidable: {
        maxFileSize: 200 * 1024 * 1024 // Defaults to 200mb
      }
    }
  },
  //...
};
```

#### Responsive Images

When the `Enable responsive friendly upload` setting is enabled in the settings panel the plugin will generate the following responsive image sizes:
| Name    | Largest Dimension |
| :------ | :--------- |
| large   | 1000px     |
| medium  | 750px      |
| small   | 500px      |

These sizes can be overridden in `config/plugins.js`:
```javascript
module.exports = {
  upload: {
    breakpoints: {
      xlarge: 1920,
      large: 1000,
      medium: 750,
      small: 500,
      xsmall: 64
    }
  }
}
```
::: warning
  Breakpoint changes will only apply to new images, existing images will not be resized or have new sizes generated.
:::

## Endpoints

<style lang="stylus">
#endpoint-table
  table
    display table
    width 100%

  tr
    border none
    &:nth-child(2n)
      background-color white

  tbody
    tr
      border-top 1px solid #dfe2e5

  th, td
    border none
    padding 1.2em 1em
    border-right 1px solid #dfe2e5
    &:last-child
      border-right none
</style>

<div id="endpoint-table">

| Method | Path              | Description         |
| :----- | :---------------- | :------------------ |
| GET    | /upload/files     | Get a list of files |
| GET    | /upload/files/:id | Get a specific file |
| POST   | /upload           | Upload files        |
| DELETE | /upload/files/:id | Delete a file       |

</div>

## Upload files

To upload files into your application.

### Parameters

- `files`: The file(s) to upload. The value(s) can be a Buffer or Stream.

### Code example

```html
<form>
  <!-- Can be multiple files -->
  <input type="file" name="files" />
  <input type="submit" value="Submit" />
</form>

<script type="text/javascript">
  const formElement = document.querySelector('form');

  formElement.addEventListener('submit', (e) => {
    e.preventDefault();

    const request = new XMLHttpRequest();

    request.open('POST', '/upload');

    request.send(new FormData(formElement));
  });
</script>
```

::: warning
You have to send FormData in your request body
:::

## Upload files related to an entry

To upload files that will be linked to a specific entry.

### Request parameters

- `files`: The file(s) to upload. The value(s) can be a Buffer or Stream.
- `path` (optional): The folder where the file(s) will be uploaded to (only supported on strapi-provider-upload-aws-s3).
- `refId`: The ID of the entry which the file(s) will be linked to.
- `ref`: The name of the model which the file(s) will be linked to (see more below).
- `source` (optional): The name of the plugin where the model is located.
- `field`: The field of the entry which the file(s) will be precisely linked to.

### Examples

The `Restaurant` model attributes:

```json
"attributes": {
  "name": {
    "type": "string"
  },
  "cover": {
    "model": "file",
    "via": "related",
    "plugin": "upload"
  }
}
```

Code

```html
<form>
  <!-- Can be multiple files if you setup "collection" instead of "model" -->
  <input type="file" name="files" />
  <input type="text" name="ref" value="restaurant" />
  <input type="text" name="refId" value="5c126648c7415f0c0ef1bccd" />
  <input type="text" name="field" value="cover" />
  <input type="submit" value="Submit" />
</form>

<script type="text/javascript">
  const formElement = document.querySelector('form');

  formElement.addEventListener('submit', (e) => {
    e.preventDefault();

    const request = new XMLHttpRequest();

    request.open('POST', '/upload');

    request.send(new FormData(formElement));
  });
</script>
```

::: warning
You have to send FormData in your request body
:::

## Upload file during entry creation

You can also add files during your entry creation.

### Examples

The `Restaurant` model attributes:

```json
"attributes": {
  "name": {
    "type": "string"
  },
  "cover": {
    "model": "file",
    "via": "related",
    "plugin": "upload"
  }
}
```

Code

```html
<form>
  <!-- Can be multiple files if you setup "collection" instead of "model" -->
  <input type="text" name="name" />
  <input type="file" name="cover" />
  <input type="submit" value="Submit" />
</form>

<script type="text/javascript">
  const formElement = document.querySelector('form');

  formElement.addEventListener('submit', (e) => {
    e.preventDefault();

    const request = new XMLHttpRequest();

    const formData = new FormData();

    const formElements = formElement.elements;

    const data = {};

    for (let i = 0; i < formElements.length; i++) {
      const currentElement = formElements[i];
      if (!['submit', 'file'].includes(currentElement.type)) {
        data[currentElement.name] = currentElement.value;
      } else if (currentElement.type === 'file') {
        if (currentElement.files.length === 1) {
          const file = currentElement.files[0];
          formData.append(`files.${currentElement.name}`, file, file.name);
        } else {
          for (let i = 0; i < currentElement.files.length; i++) {
            const file = currentElement.files[i];

            formData.append(`files.${currentElement.name}`, file, file.name);
          }
        }
      }
    }

    formData.append('data', JSON.stringify(data));

    request.open('POST', `${HOST}/restaurants`);

    request.send(formData);
  });
</script>
```

Your entry data has to be contained in a `data` key. You have to `JSON.stringify` your data object.

And for your files, they have to be prefixed by `files`.
Example here with cover attribute `files.cover`.

::: tip
If you want to upload files for a component, you will have to specify the index of the item you want to add the file to.
Example `files.my_component_name[the_index].attribute_name`
:::

::: warning
You have to send FormData in your request body
:::

## Models definition

Adding a file attribute to a model (or the model of another plugin) is like adding a new association.

In the first example below, you will be able to upload and attach one file to the avatar attribute.

**Path —** `User.settings.json`.

```json
{
  "connection": "default",
  "attributes": {
    "pseudo": {
      "type": "string",
      "required": true
    },
    "email": {
      "type": "email",
      "required": true,
      "unique": true
    },
    "avatar": {
      "model": "file",
      "via": "related",
      "plugin": "upload"
    }
  }
}
```

In our second example, you can upload and attach multiple pictures to the restaurant.

**Path —** `Restaurant.settings.json`.

```json
{
  "connection": "default",
  "attributes": {
    "name": {
      "type": "string",
      "required": true
    },
    "convers": {
      "collection": "file",
      "via": "related",
      "plugin": "upload"
    }
  }
}
```

## Using a provider

By default Strapi provides a provider that uploads files to a local directory. You might want to upload your files to another provider like AWS S3.

You can check all the available providers developed by the community on npmjs.org - [Providers list](https://www.npmjs.com/search?q=strapi-provider-upload-&ranking=popularity)

To install a new provider run:

:::: tabs

::: tab yarn

```
yarn add strapi-provider-upload-aws-s3
```

:::

::: tab npm

```
npm install strapi-provider-upload-aws-s3 --save
```

:::

::::

### Local server

By default Strapi accepts `localServer` configurations for locally uploaded files. They will be passed as the options for [koa-static](https://github.com/koajs/static).

You can provide them by create or edit the file at `./config/plugins.js`. The example below set `max-age` header.

```js
module.exports = ({ env })=>({
  upload: {
    providerOptions: {
      localServer: {
        maxage: 300000
      }
    }
  }
});
```

### Using scoped packages as providers

If your package name is [scoped](https://docs.npmjs.com/about-scopes) (for example `@username/strapi-provider-upload-aws2`) you need to take an extra step by aliasing it in `package.json`. Go to the `dependencies` section and change the provider line to look like this:

`"strapi-provider-upload-aws2": "npm:@username/strapi-provider-upload-aws2@0.1.9"`

The string after the last `@` represents your desired [semver](https://docs.npmjs.com/about-semantic-versioning) version range.

### Enabling the provider

To enable the provider, create or edit the file at `./config/plugins.js`

```js
module.exports = ({ env }) => ({
  upload: {
    provider: 'aws-s3',
    providerOptions: {
      accessKeyId: env('AWS_ACCESS_KEY_ID'),
      secretAccessKey: env('AWS_ACCESS_SECRET'),
      region: 'aws-region',
      params: {
        Bucket: 'my-bucket',
      },
    },
  },
});
```

Make sure to read the provider's `README` to know what are the possible parameters.

### Configuration per environment

When configuring your upload provider you might want to change the configuration based on the `NODE_ENV` environment variable or use environment specific credentials.

You can set a specific configuration in the `./config/env/{env}/plugins.js` configuration file and it will be used to overwrite the one in the default configuration.

## Create providers

You can create a Node.js module to implement a custom provider. Read the official documentation [here](https://docs.npmjs.com/creating-node-js-modules).

To work with strapi, your provider name must match the pattern `strapi-provider-upload-{provider-name}`.

Your provider need to export the following interface:

```js
module.exports = {
  init(providerOptions) {
    // init your provider if necessary

    return {
      upload(file) {
        // upload the file in the provider
      },
      delete(file) {
        // delete the file in the provider
      },
    };
  },
};
```

You can then publish it to make it available to the community.

### Create a local provider

If you want to create your own provider without publishing it on **npm** you can follow these steps:

- Create a `./providers/strapi-provider-upload-{provider-name}` folder in your root application folder.
- Create your provider as explained in the [documentation](#create-providers) above.
- Then update your `package.json` to link your `strapi-provider-upload-{provider-name}` dependency to point to the [local path](https://docs.npmjs.com/files/package.json#local-paths) of your provider.

```json
{
  ...
  "dependencies": {
    ...
    "strapi-provider-upload-{provider-name}": "file:providers/strapi-provider-upload-{provider-name}"
    ...
  }
}
```

- Finally, run `yarn install` or `npm install` to install your new custom provider.
