# Injection Zones API

Injection zones refer to areas of a view's layout where a plugin allows another to inject a custom React component (e.g. a UI element like a button).

Plugins can use:

* Strapi's [predefined injection zones](#using-predefined-injection-zones) for the Content Manager,
* or custom injection zones, created by a plugin

:::note
Injection zones are defined in the [register()](#register) lifecycle but components are injected in the [bootstrap()](#bootstrap) lifecycle.
:::

## Using predefined injection zones

<!-- TODO: link to the proper page once CM section of user guide is converted -->
Strapi admin panel comes with predefined injection zones so components can be added to the UI of the [Content Manager](/user-docs/intro):

<!-- TODO: maybe add screenshots once the design system is ready? -->

| View      | Injection zone name & Location                                                                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| List view | <ul><li>`actions`: sits between Filters and the cogs icon</li><li>`deleteModalAdditionalInfos()`: sits at the bottom of the modal displayed when deleting items</li></ul> |
| Edit view | <ul><li>`informations`: sits at the top right of the edit view</li><li>`right-links`: sits between "Configure the view" and "Edit" buttons</li></ul>                       |

## Creating a custom injection zone

To create a custom injection zone, declare it as a `<InjectionZone />` React component with an `area` prop that takes a string with the following naming convention: `plugin-name.viewName.injectionZoneName`.

## Injecting components

A plugin has 2 different ways of injecting a component:

* to inject a component from a plugin into another plugin's injection zones, use the `injectComponent()` function
* to specifically inject a component into one of the Content Manager's [predefined injection zones](#using-predefined-injection-zones), use the `injectContentManagerComponent()` function instead

Both the `injectComponent()` and `injectContentManagerComponent()` methods accept the following arguments:

| Argument        | Type   | Description                                                                                                                                                                   |
| --------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| first argument  | String | The view where the component is injected
| second argument | String | The zone where the component is injected
| third argument  | Object | An object with the following keys:<ul><li>`name` (string): the name of the component</li><li>`Component` (function or class): the React component to be injected</li></ul> |

<details>
<summary>Example: Inject a component in the informations box of the Edit View of the Content Manager:</summary>

```jsx title="my-plugin/admin/src/index.js"

export default {
  bootstrap(app) {
    app.injectContentManagerComponent('editView', 'informations', {
      name: 'my-plugin-my-compo',
      Component: () => 'my-compo',
    });
  }
}
```

</details>

<details>
<summary>Example: Creating a new injection zone and injecting it from a plugin to another one:</summary>

```jsx title="my-plugin/admin/src/injectionZones.js"
// Use the injection zone in a view

import { InjectionZone } from '@strapi/helper-plugin';

const HomePage = () => {
  return (
    <main>
      <h1>This is the homepage</h1>
	    <InjectionZone area="my-plugin.homePage.right" />
    </main>
  );
};
```

```jsx title="my-plugin/admin/src/index.js"
// Declare this injection zone in the register lifecycle of the plugin

export default {
  register() {
    app.registerPlugin({
      // ...
      injectionZones: {
        homePage: {
          right: []
        }
      }
    });
  },
}
```

```jsx title="my-other-plugin/admin/src/index.js"
// Inject the component from a plugin in another plugin

export default {
  register() {
    // ...
  },
  bootstrap(app) {
    app.getPlugin('my-plugin').injectComponent('homePage', 'right', {
      name: 'my-other-plugin-component',
      Component: () => 'This component is injected',
    });
  }
};
```

</details>

#### Accessing data with the `useCMEditViewDataManager` React hook

Once an injection zone is defined, the component to be injected in the Content Manager can have access to all the data of the Edit View through the `useCMEditViewDataManager` React hook.

<details>
<summary>Example of a basic component using the 'useCMEditViewDataManager' hook</summary>

```js
import { useCMEditViewDataManager } from '@strapi/helper-plugin';

const MyCompo = () => {
  const {
    createActionAllowedFields: [], // Array of fields that the user is allowed to edit
    formErrors: {}, // Object errors
    readActionAllowedFields: [], // Array of field that the user is allowed to edit
    slug: 'api::address.address', // Slug of the content-type
    updateActionAllowedFields: [],
    allLayoutData: {
      components: {}, // components layout
      contentType: {}, // content-type layout
    },
    initialData: {},
    isCreatingEntry: true,
    isSingleType: true,
    status: 'resolved',
    layout: {}, // Current content-type layout
    hasDraftAndPublish: true,
    modifiedData: {},
    onPublish: () => {},
    onUnpublish: () => {},
    addComponentToDynamicZone: () => {},
    addNonRepeatableComponentToField: () => {},
    addRelation: () => {},
    addRepeatableComponentToField: () => {},
    moveComponentDown: () => {},
    moveComponentField: () => {},
    moveComponentUp: () => {},
    moveRelation: () => {},
    onChange: () => {},
    onRemoveRelation: () => {},
    removeComponentFromDynamicZone: () => {},
    removeComponentFromField: () => {},
    removeRepeatableField: () => {},
  } = useCMEditViewDataManager()

  return null
}
```

</details>