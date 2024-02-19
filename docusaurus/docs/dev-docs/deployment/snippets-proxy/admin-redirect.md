### Redirecting landing page to admin panel

If you do not wish to have the default landing page mounted on `/` you can create a custom middleware using the sample code below to automatically redirect to your admin panel.

:::caution
This sample configuration expects that the admin panel is accessible on `/admin`. If you used one of the above configurations to change this to `/dashboard` you will also need to adjust this sample configuration.
:::

```js title="./config/middlewares.js"
module.exports = ({ env }) => [
	// ...
	{ resolve: '../src/middlewares/admin-redirect' },
];

```

```js title="./src/middlewares/admin-redirect.js"
module.exports = (_config, { strapi }) => {
	const redirects = ['/', '/index.html'].map((path) => ({
		method: 'GET',
		path,
		handler: (ctx) => ctx.redirect('/admin'),
		config: { auth: false },
	}));

	strapi.server.routes(redirects);
};
```
