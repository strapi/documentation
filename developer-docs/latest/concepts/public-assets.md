# Public Assets

Public assets are static files such as images, video, css, etc. that you want to make accessible to the outside world.

Because an API may need to serve static assets, every new Strapi project includes by default, a folder named `/public`. Any file located in this directory is accessible if the request's path doesn't match any other defined route and if it matches a public file name.

#### Example

An image named `company-logo.png` in `./public/` is accessible through `/company-logo.png` URL.

::: tip
`index.html` files are served if the request corresponds to a folder name (`/pictures` url will try to serve `public/pictures/index.html` file).
:::

::: warning
The dotfiles are not exposed. It means that every file name that starts with `.`, such as `.htaccess` or `.gitignore`, are not served.
:::

Refer to the [public assets configurations](./configurations.md#Application) for more information.
