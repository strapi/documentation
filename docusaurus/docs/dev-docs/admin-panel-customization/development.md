Strapi's admin panel is a React-based single-page application. It encapsulates all the features and installed plugins of a Strapi application. Some of its aspects can be [customized](#customization-options), and plugins can also [extend](#extension) it.

To start your strapi instance with hot reloading while developing, run the following command:

```bash
cd my-app # cd into the root directory of the Strapi application project
strapi develop
```

:::note
In Strapi 5, the server runs in `watch-admin` mode by default, so the admin panel auto-reloads whenever you change its code. This simplifies admin panel and front-end plugins development. To disable this, run `strapi develop --no-watch-admin` (see [CLI reference](/dev-docs/cli#strapi-develop)).
:::
