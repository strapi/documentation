### Redirecting landing page to Admin Panel

If you do not wish to have the default landing page mounted on `/` you can create a custom `./public/index.html` using the sample code below to automatically redirect to your Admin Panel.

:::caution Admin Panel Route
This sample configuration expects that your Admin Panel is accessible on on `/admin` if you used one of the above configurations to change this to `/dashboard` you will also need to adjust this sample config.
:::

**Path —** `./public/index.html`

```html
<html>
  <head>
    <meta http-equiv="refresh" content="0;URL='/admin'" />
  </head>
</html>
```
