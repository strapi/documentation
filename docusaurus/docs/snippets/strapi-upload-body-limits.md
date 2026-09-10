On the Strapi side, the `body` middleware parses incoming requests. Uploaded files arrive as multipart data, so `formidable.maxFileSize` is the option that caps them. The `formLimit` and `jsonLimit` options cover ordinary form fields and JSON payloads, not the file itself:

```js title="/config/middlewares.js"
module.exports = [
  // ...
  {
    name: 'strapi::body',
    config: {
      formLimit: '100mb', // form body
      jsonLimit: '100mb', // JSON body
      textLimit: '100mb', // text body
      formidable: {
        maxFileSize: 100 * 1024 * 1024, // uploaded file size, in bytes
      },
    },
  },
  // ...
];
```

The Media Library provider enforces a separate `sizeLimit`, which defaults to 1 GB (see [local upload provider configuration](/cms/configurations/media-library-providers/local-upload) and [max file size](/cms/features/media-library#max-file-size) to change it).
