# Customization

## Plugin extensions

In Strapi you can install plugins in your `node_modules`. This allows for easy updates and respect best practices. To customize those installed plugins you can work in the `/extensions` directory. It contains all the plugins' customizable files.

Some plugins will create files in these folders so you can then modify them. You can also create certain files manually to add some custom configuration.

Extensions folder structure:

- `extensions/`
  - `**`: Plugin Id
    - `admin`: You can extend a plugin's admin by creating a file with the same name, doing so will override the original one.
    - `config`: You can extend a plugin's configuration by adding a settings.json file with your custom configuration.
    - `models`: Contains the plugin's models that you have overwritten (e.g. when you add a relation to the User model).
    - `controllers`: You can extend the plugin's controllers by creating controllers with the same names and override certain methods.
    - `services`: You can extend the plugin's services by creating services with the same names and override certain methods.

::: warning
When using **extensions** you will need to update your code whenever you upgrade your strapi version. Not updating and comparing your **extensions** with the new changes on the repository, can break your app in unexpected ways that we cannot predict in the [migration guides](../migration-guide/README.md).
:::

## Admin extension

The admin panel is a `node_module` that is similar to a plugin, with the slight difference that it encapsulates all the installed plugins of your application.

To extend this package you will have to create an `admin` folder at the root of your application.

In this folder you will be able to override admin files and functions.

::: tip
For more details, visit the [admin panel customization](../admin-panel/customization.md) documentation.
:::
