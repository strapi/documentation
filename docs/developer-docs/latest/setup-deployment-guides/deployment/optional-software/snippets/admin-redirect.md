### Redirecting landing page to admin panel

If you do not wish to have the default landing page mounted on `/` you can create a custom `./public/index.html` using the following sample code to automatically redirect to your admin panel.

:::caution
This sample configuration expects that the admin panel is accessible on `/admin`. If you used one of the above configurations to change this to `/dashboard` you will also need to adjust this sample configuration.
:::

**Path —** `./public/index.html`

```html
<html>
  <head>
    <meta http-equiv="refresh" content="0;URL='/admin'" />
  </head>
</html>
```
