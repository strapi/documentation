---
title: Strapi global variable
displayed_sidebar: devDocsSidebar
description: Migrate calls to the strapi global variable from Strapi v3.6.x to v4.0.x with step-by-step instructions

---

# v4 code migration: Updating `strapi` global variable calls

This guide is part of the [v4 code migration guide](/dev-docs/migration/v3-to-v4/code-migration.md) designed to help you migrate the code of a Strapi application from v3.6.x to v4.0.x

:::strapi v3/v4 comparison
In Strapi v3,  a `window.strapi` global variable is used to display notifications, freeze user interactions when requests are pending, and get the backend URL.

In Strapi v4, `strapi.notification`, `strapi.lockApp` and `strapi.unlockApp` are not supported anymore and replaced by specific React hooks. Calls to `strapi.backendUrl` are still supported.
:::

To migrate to Strapi v4:

1. Remove all calls to `strapi.notification`, `strapi.lockApp` and `strapi.unlockApp` from the code.

2. Adapt your code, using the following table to find Strapi v4 hooks equivalent to Strapi v3 features. All hooks are provided by the `@strapi/helper-plugin` module:

    | Feature in v3               | Equivalent feature in v4                             |
    | --------------------------- | ---------------------------------------------------- |
    | `strapi.notification` calls | `useNotification` hook                               |
    | `strapi.lockApp` calls      | `lockApp` method from the `useOverlayBlocker` hook   |
    | `strapi.unlockApp` calls    | `unlockApp` method from the `useOverlayBlocker` hook |
    | `strapi.backendUrl` calls   | `strapi.backendUrl` calls _(still exist in Strapi v4)_  |

The following examples should help you get started using the `useNotification` hook and `lockApp`/`unlockApp` methods:

<details>
<summary> Example of using the useNotification hook in Strapi v4:</summary>

```js title="./src/plugins/<my-plugin>/admin/*.js"

import { useNotification } from '@strapi/helper-plugin';
import { Button, Main } from '@strapi/design-system';

const HomePage = () => {
  const toggleNotification = useNotification();

  const handleClick = () => {
    toggleNotification({
        // required
        type: 'info|success|warning', // choose one from the list
        // required
        message: { id: 'notification.version.update.message', defaultMessage: 'A new version is available' },
        // optional
        link: {
          url: 'https://github.com/strapi/strapi/releases/tag/v4',
          label: {
            id: 'notification.version.update.link',
            defaultMessage: 'See more'
          },
        },
        // optional, default = false
        blockTransition: true,
        // optional
        onClose: () => localStorage.setItem('STRAPI_UPDATE_NOTIF', true),
      });
  }

  return (
    <Main>
      <h1>This is the homepage</h1>
      <Button onClick={handleClick}>Display notification</Button>
    </Main>
  );
};
```

</details>

<details> 
<summary>Example of using the lockApp and unlockApp methods in Strapi v4:</summary>

```js title="./src/plugins/<my-plugin>/admin/*.js"

import { useOverlayBlocker } from '@strapi/helper-plugin';

const MyCompo = () => {
const { lockApp, unlockApp } = useOverlayBlocker();

 return null
}
```

</details>

<details>
<summary> Example of logging the backend URL value in Strapi v4:</summary>

```js title="./src/plugins/<my-plugin>/*.js"

const myHelper = () => {
  console.log(strapi.backendURL); // http://localhost:1337
};
```

</details>

## Using the `@strapi/helper-plugin` Storybook

The `@strapi/helper-plugin` module provided with Strapi v4 features a [Storybook](https://storybook.js.org/) instance. The Storybook instance can be run to display further documentation about the internal components specifically targeted for the Strapi admin panel. This includes information about the `useNotification` hook. To access the documentation included with `@strapi/helper-plugin`:

1. Clone the Strapi repository:

    ```sh
    git clone git@github.com:strapi/strapi.git
    ```

2. Install all the dependencies:

    ```sh
    cd strapi && yarn setup
    ```

3. Run the `@strapi/helper-plugin` Storybook instance:

    ```sh
    cd packages/core/helper-plugin
    yarn storybook
    ```

:::tip
When running the Storybook instance provided with the `@strapi/helper-plugin`, the documentation for the `useNotification` hook can be found at [http://localhost:6006/?path=/story/hooks-usenotification--page](http://localhost:6006/?path=/story/hooks-usenotification--page).
:::
