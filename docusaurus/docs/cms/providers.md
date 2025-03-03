---
title: Providers
description: Install and use providers to extend the functionality of available plugins.
tags:
- environment
- providers

---

# Email and Upload Providers

2 Strapi features, [Email](/cms/features/email) and the [Media Library](/cms/features/media-library), can be extended via the installation and configuration of additional providers.

Providers add an extension to the core capabilities of the plugin, for example to upload media files to AWS S3 instead of the local server, or using Amazon SES for emails instead of Sendmail.

There are both official providers maintained by Strapi — discoverable via the <ExternalLink to="../../../cms/plugins/installing-plugins-via-marketplace" text="Marketplace"/> — and many community maintained providers available via <ExternalLink to="https://www.npmjs.com/" text="npm"/>.

A provider can be configured to be [private](#private-providers) to ensure asset URLs will be signed for secure access.

## Installing providers

New providers can be installed using `npm` or `yarn` using the following format `@strapi/provider-<plugin>-<provider> --save`.

For example:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

Install the AWS S3 provider for the Upload (Media Library) feature:

```bash
yarn add @strapi/provider-upload-aws-s3
```

Install the Sendgrid provider for the Email feature:

```bash
yarn add @strapi/provider-email-sendgrid
```

</TabItem>

<TabItem value="npm" label="npm">

Install the AWS S3 provider for the Upload (Media Library) feature:

```bash
npm install @strapi/provider-upload-aws-s3 --save
```

Install the Sendgrid provider for the Email feature:

```bash
npm install @strapi/provider-email-sendgrid --save
```

</TabItem>

</Tabs>

## Configuring providers

Newly installed providers are enabled and configured in [the `/config/plugins` file](/cms/configurations/plugins). If this file does not exist you must create it.

Each provider will have different configuration settings available. Review the respective entry for that provider in the <ExternalLink to="../../../cms/plugins/installing-plugins-via-marketplace" text="Marketplace"/> or <ExternalLink to="https://www.npmjs.com/" text="npm"/> to learn more.

The following are example configurations for the Upload (Media Library) and Email features:

<Tabs>

<TabItem value="Upload" label="Upload (Media Library)">

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/plugins.js"

module.exports = ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        baseUrl: env('CDN_URL'),
        rootPath: env('CDN_ROOT_PATH'),
        s3Options: {
          credentials: {
            accessKeyId: env('AWS_ACCESS_KEY_ID'),
            secretAccessKey: env('AWS_ACCESS_SECRET'),
          },
          region: env('AWS_REGION'),
          params: {
            ACL: env('AWS_ACL', 'public-read'),
            signedUrlExpires: env('AWS_SIGNED_URL_EXPIRES', 15 * 60),
            Bucket: env('AWS_BUCKET'),
          },
        },
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
  // ...
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="/config/plugins.ts"

export default ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: 'aws-s3', // For community providers pass the full package name (e.g. provider: 'strapi-provider-upload-google-cloud-storage')
      providerOptions: {
        accessKeyId: env('AWS_ACCESS_KEY_ID'),
        secretAccessKey: env('AWS_ACCESS_SECRET'),
        region: env('AWS_REGION'),
        params: {
          ACL: env('AWS_ACL', 'public-read'), // 'private' if you want to make the uploaded files private
          Bucket: env('AWS_BUCKET'),
        },
      },
    },
  },
  // ...
});
```

</TabItem>

</Tabs>

:::note
Strapi has a default [`security` middleware](/cms/configurations/middlewares#security) that has a very strict `contentSecurityPolicy` that limits loading images and media to `"'self'"` only, see the example configuration on the <ExternalLink to="https://www.npmjs.com/package/@strapi/provider-upload-aws-s3" text="provider page"/> or the [middleware documentation](/cms/configurations/middlewares#security) for more information.
:::

</TabItem>

<TabItem value="Email" label="Email">

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="/config/plugins.js"

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

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="/config/plugins.ts"

export default ({ env }) => ({
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

</TabItem>

</Tabs>

:::note

* When using a different provider per environment, specify the correct configuration in `/config/env/${yourEnvironment}/plugins.js|ts` (See [Environments](/cms/configurations/environment)).
* Only one email provider will be active at a time. If the email provider setting isn't picked up by Strapi, verify the `plugins.js|ts` file is in the correct folder.
* When testing the new email provider with those two email templates created during strapi setup, the _shipper email_ on the template defaults to `no-reply@strapi.io` and needs to be updated according to your email provider, otherwise it will fail the test (See [Configure templates locally](/cms/features/users-permissions#templating-emails)).

:::

</TabItem>
</Tabs>

### Configuration per environment

When configuring your provider you might want to change the configuration based on the `NODE_ENV` environment variable or use environment specific credentials.

You can set a specific configuration in the `/config/env/{env}/plugins.js|ts` configuration file and it will be used to overwrite the default configuration.

## Creating providers

To implement your own custom provider you must <ExternalLink to="https://docs.npmjs.com/creating-node-js-modules" text="create a Node.js module"/>.

The interface that must be exported depends on the plugin you are developing the provider for. The following are templates for the Upload (Media Library) and Email features:

<Tabs>
<TabItem value="Upload" label="Upload (Media Library)">

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

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
        // (optional)
        // implement your own file size limit logic
      },
      getSignedUrl(file) {
        // (optional)
        // Generate a signed URL for the given file.
        // The signed URL allows secure access to the file.
        // Only Content Manager assets will be signed.
        // Returns an object {url: string}.
      },
      isPrivate() {
        // (optional)
        // if it is private, file urls will be signed
        // Returns a boolean
      },
    };
  },
};
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts
export default {
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
        // (optional)
        // implement your own file size limit logic
      },
      getSignedUrl(file) {
        // (optional)
        // Generate a signed URL for the given file.
        // The signed URL allows secure access to the file.
        // Only Content Manager assets will be signed.
        // Returns an object {url: string}.
      },
      isPrivate() {
        // (optional)
        // if it is private, file urls will be signed
        // Returns a boolean
      },
    };
  },
};
```

</TabItem>

</Tabs>

</TabItem>

<TabItem value="Email" label="Email">

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js
module.exports = {
  init: (providerOptions = {}, settings = {}) => {
    return {
      send: async options => {},
    };
  },
};
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts
export {
  init: (providerOptions = {}, settings = {}) => {
    return {
      send: async options => {},
    };
  },
};
```

</TabItem>

</Tabs>

</TabItem>
</Tabs>

In the send function you will have access to:

* `providerOptions` that contains configurations written in `plugins.js|ts`
* `settings` that contains configurations written in `plugins.js|ts`
* `options` that contains options you send when you call the send function from the email plugin service

You can review the <ExternalLink to="https://github.com/strapi/strapi/tree/master/packages/providers" text="Strapi-maintained providers"/> for example implementations.

After creating your new provider you can <ExternalLink to="https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages" text="publish it to npm"/> to share with the community or [use it locally](#local-providers) for your project only.

### Local providers

If you want to create your own provider without publishing it on npm you can follow these steps:

1. Create a `providers` folder in your application.
2. Create your provider (e.g. `/providers/strapi-provider-<plugin>-<provider>`)
3. Then update your `package.json` to link your `strapi-provider-<plugin>-<provider>` dependency to the <ExternalLink to="https://docs.npmjs.com/files/package.json#local-paths" text="local path"/> of your new provider.

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

4. Update your `/config/plugins.js|ts` file to [configure the provider](#configuring-providers).
5. Finally, run `yarn` or `npm install` to install your new custom provider.

### Private providers

You can set up a private provider, meaning that every asset URL displayed in the Content Manager will be signed for secure access.

To enable private providers, you must implement the `isPrivate()` method and return `true`.



In the backend, Strapi generates a signed URL for each asset using the `getSignedUrl(file)` method implemented in the provider. The signed URL includes an encrypted signature that allows the user to access the asset (but normally only for a limited time and with specific restrictions, depending on the provider).

Note that for security reasons, the content API will not provide any signed URLs. Instead, developers using the API should sign the urls themselves.

**Example**

To create a private `aws-s3` provider:

1. Create a `/providers/aws-s3` folder in your application. See [Local Providers](#local-providers) for more information.
2. Implement the `isPrivate()` method in the `aws-s3` provider to return `true`.
3. Implement the `getSignedUrl(file)` method in the `aws-s3` provider to generate a signed URL for the given file.

<Tabs groupId="js-ts">

<TabItem value="js" label="JavaScript">

```js title="/providers/aws-s3/index.js"
// aws-s3 provider

module.exports = {
  init: (config) => {
    const s3 = new AWS.S3(config);

    return {
      async upload(file) {
        // code to upload file to S3
      },

      async delete(file) {
        // code to delete file from S3
      },

      async isPrivate() {
        return true;
      },

      async getSignedUrl(file) {
        const params = {
          Bucket: config.params.Bucket,
          Key: file.path,
          Expires: 60, // URL expiration time in seconds
        };

        const signedUrl = await s3.getSignedUrlPromise("getObject", params);
        return { url: signedUrl };
      },
    };
  },
};
```

</TabItem>

<TabItem value="ts" label="TypeScript">

```ts title="/providers/aws-s3/index.ts"
// aws-s3 provider

export = {
  init: (config) => {
    const s3 = new AWS.S3(config);

    return {
      async upload(file) {
        // code to upload file to S3
      },

      async delete(file) {
        // code to delete file from S3
      },

      async isPrivate() {
        return true;
      },

      async getSignedUrl(file) {
        const params = {
          Bucket: config.params.Bucket,
          Key: file.path,
          Expires: 60, // URL expiration time in seconds
        };

        const signedUrl = await s3.getSignedUrlPromise("getObject", params);
        return { url: signedUrl };
      },
    };
  },
};
```

</TabItem>

</Tabs>

<FeedbackPlaceholder />
