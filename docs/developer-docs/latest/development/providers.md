---
title: Providers - Strapi Developer Docs
description: Install and use providers to extend the functionality of available plugins.
canonicalUrl: https://docs.strapi.io/developer-docs/latest/development/providers.html
---

# Providers

Certain [plugins](../../../user-docs/latest/plugins/introduction-to-plugins.md) can be extended via the installation and configuration of additional [providers](../../../user-docs/latest/plugins/introduction-to-plugins.md#providers).

Providers add an extension to the core capabilities of the plugin, for example to upload media files to AWS S3 instead of the local server, or using Amazon SES for emails instead of Sendmail.

::: note
Only the [Upload](../plugins/upload.md) and [Email](../plugins/email.md) plugins are currently designed to work with providers. 
:::

For the relevant plugins, there are both official providers maintained by Strapi — discoverable via the [Marketplace](../../../user-docs/latest/plugins/installing-plugins-via-marketplace.md) — and many community maintained providers available via [npm](https://www.npmjs.com/).

## Installing providers

New providers can be installed using `npm` or `yarn` using the following format `@strapi/provider-<plugin>-<provider> --save`.

For example:

<code-group>

<code-block title="NPM">
```sh
# Install the AWS S3 provider for the Upload plugin
npm install @strapi/provider-upload-aws-s3 --save

# Install the Sendgrid provider for the Email plugin
npm install @strapi/provider-email-sendgrid --save
```
</code-block>

<code-block title="YARN">
```sh
# Install the AWS S3 provider for the Upload plugin
yarn add @strapi/provider-upload-aws-s3

# Install the Sendgrid provider for the Email plugin
yarn add @strapi/provider-email-sendgrid --save
```
</code-block>

</code-group>

## Configuring providers

Newly installed providers are enabled and configured in the `./config/plugins.js` file. If this file does not exist you must create it.

Each provider will have different configuration settings available. Review the respective entry for that provider in the [Marketplace](../../../user-docs/latest/plugins/installing-plugins-via-marketplace.md) or [npm](https://www.npmjs.com/) to learn more.

Below are example configurations for the Upload and Email plugins.

:::: tabs card

::: tab Upload

```js
// path: ./config/plugins.js

module.exports = ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: 'aws-s3', // For community providers pass the full package name (e.g. provider: 'strapi-provider-upload-google-cloud-storage')
      providerOptions: {
        accessKeyId: env('AWS_ACCESS_KEY_ID'),
        secretAccessKey: env('AWS_ACCESS_SECRET'),
        region: env('AWS_REGION'),
        params: {
          Bucket: env('AWS_BUCKET'),
        },
      },
    },
  },
  // ...
});
```

::: note
Strapi has a default [`security` middleware](/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.md#security) that has a very strict `contentSecurityPolicy` that limits loading images and media to `"'self'"` only, see the example configuration on the [provider page](https://www.npmjs.com/package/@strapi/provider-upload-aws-s3) or the [middleware documentation](/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.md#security) for more information.
:::

::: tab Email

```js
// path: ./config/plugins.js

module.exports = ({ env }) => ({
  // ...
  email: {
    config: {
      provider: 'sendgrid', // For community providers pass the full package name (e.g. provider: 'strapi-provider-email-mandrill')
      providerOptions: {
        apiKey: env('SENDGRID_API_KEY'),
      },
      settings: {
        defaultFrom: 'juliasedefdjian@strapi.io',
        defaultReplyTo: 'juliasedefdjian@strapi.io',
        testAddress: 'juliasedefdjian@strapi.io',
      },
    },
  },
  // ...
});
```

Keep in mind that:

* When using a different provider per environment, specify the correct configuration in `./config/env/${yourEnvironment}/plugins.js` (See [Environments](/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.md)).
* Only one email provider will be active at a time. If the email provider setting isn't picked up by Strapi, verify the `plugins.js` file is in the correct folder.
* When testing the new email provider with those two email templates created during strapi setup, the _shipper email_ on the template defaults to `no-reply@strapi.io` and needs to be updated according to your email provider, otherwise it will fail the test (See [Configure templates locally](/user-docs/latest/settings/configuring-users-permissions-plugin-settings.md#configuring-email-templates)).

:::

::::

### Configuration per environment

When configuring your provider you might want to change the configuration based on the `NODE_ENV` environment variable or use environment specific credentials.

You can set a specific configuration in the `./config/env/{env}/plugins.js` configuration file and it will be used to overwrite the default configuration.

## Creating providers

To implement your own custom provider you must [create a Node.js module](https://docs.npmjs.com/creating-node-js-modules).

The interface that must be exported depends on the plugin you are developing the provider for. Below are templates for the Upload and Email plugins:

:::: tabs card

::: tab Upload

```js
module.exports = {
  init(providerOptions) {
    // init your provider if necessary

    return {
      upload(file) {
        // upload the file in the provider
        // file content is accessible by `file.buffer`
      },
      uploadStream(file) {
        // upload the file in the provider
        // file content is accessible by `file.stream`
      },
      delete(file) {
        // delete the file in the provider
      },
      checkFileSize(file, { sizeLimit }) {
        // implement your own file size limit logic
        // there is a default logic in place if this
        // method is not implemented
      },
    };
  },
};
```
:::
::: tab Email

```js
module.exports = {
  init: (providerOptions = {}, settings = {}) => {
    return {
      send: async options => {},
    };
  },
};
```

In the send function you will have access to:

* `providerOptions` that contains configurations written in `plugins.js`
* `settings` that contains configurations written in `plugins.js`
* `options` that contains options you send when you call the send function from the email plugin service

:::

::::

You can review the [Strapi maintained providers](https://github.com/strapi/strapi/tree/master/packages/providers) for example implementations.

After creating your new provider you can [publish it to npm](https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages) to share with the community or [use it locally](#local-providers) for your project only.

### Local providers

If you want to create your own provider without publishing it on npm you can follow these steps:

1. Create a `providers` folder in your application.
2. Create your provider (e.g. `./providers/strapi-provider-<plugin>-<provider>`)
3. Then update your `package.json` to link your `strapi-provider-<plugin>-<provider>` dependency to the [local path](https://docs.npmjs.com/files/package.json#local-paths) of your new provider.

```json
{
  ...
  "dependencies": {
    ...
    "strapi-provider-<plugin>-<provider>": "file:providers/strapi-provider-<plugin>-<provider>",
    ...
  }
}
```

4. Update your `./config/plugins.js` file to [configure the provider](#configuring-providers).
5. Finally, run `yarn install` or `npm install` to install your new custom provider.
