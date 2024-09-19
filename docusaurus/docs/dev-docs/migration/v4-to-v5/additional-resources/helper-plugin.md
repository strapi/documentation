---
title: Helper-plugin migration reference
description: Learn how to migrate your Strapi plugins and applications to not use the `helper-plugin` package.
tags:
  - helper-plugin
  - plugins development
  - upgrade to Strapi 5
---

# `helper-plugin` migration reference

This document has been written to help developers migrate their Strapi plugins and applications to _not_ use the `helper-plugin` package.
It lists every export that existed in the `helper-plugin` package, in alphabetical order and grouped by domain.

## Components

### AnErrorOccurred

This component has been removed and refactored to be part of the `Page` component exported from `@strapi/strapi/admin`. You should use the `Page` component from there:

```tsx
// Before
import { AnErrorOccurred } from '@strapi/helper-plugin';

const MyPage = () => {
  // ...

  if (error) {
    return <AnErrorOccurred />;
  }

  // ...
};

// After
import { Page } from '@strapi/strapi/admin';

const MyPage = () => {
  // ...

  if (error) {
    return <Page.Error />;
  }

  // ...
};
```

### CheckPermissions

This component has been removed and not replaced. If you feel like you need this component, please open an issue on the Strapi repository to discuss your usecase.

We recommend using the `Page.Protect` component from `@strapi/strapi/admin` instead (see [`CheckPagePermissions`](#checkpagepermissions) for an example). If you need to check permissions for a lower level component you can use [the `useRBAC` hook](#userbac).


### CheckPagePermissions

This component has been removed and refactored to be part of the `Page` component exported from `@strapi/strapi/admin`. You should use the `Page` component from there:

```tsx
// Before
import { CheckPagePermissions } from '@strapi/helper-plugin';

const MyProtectedPage = () => {
  return (
    <CheckPagePermissions
        permissions={[action: 'plugin::my-plugin.read']}
    >
      <MyPag />
    </CheckPagePermissions>
  );
};

// After
import { Page } from '@strapi/strapi/admin';

const MyProtectedPage = () => {
  <Page.Protect permissions={[action: 'plugin::my-plugin.read']}>
  return (
    </Page.Protect>
      <MyPage />
  );
};
```

The behaviour has slightly changed, where previously no permissions would redirect you to the root of the page, now it will render the `NoPermissions` component.

### ConfirmDialog

This component has been moved and refactored. It can be imported from the `@strapi/strapi/admin` package:

```tsx
// Before
import { ConfirmDialog } from '@strapi/helper-plugin';

// After
import { ConfirmDialog } from '@strapi/strapi/admin';
```

Please see the contributors [documentation for the `ConfirmDialog` component](https://v5.contributor.strapi.io/exports/modules#confirmdialog) for more information.

### ContentBox

This component has been removed and not replaced. If you feel like you need this component, please open an issue on the Strapi repository to discuss your usecase.

### DateTimePicker

This was aliasing the design-system. You should import the component from there:

```tsx
// Before
import { DateTimePicker } from '@strapi/helper-plugin';

// After
import { DateTimePicker } from '@strapi/design-system';
```

### DynamicTable

This component was previously deprecated and has now been removed. Similar to the deprecation notice, we recommend using the `Table` component from `@strapi/strapi/admin`.

Please see the contributors [documentation for the `Table` component](https://v5.contributor.strapi.io/exports/namespaces/Table) for more information.

### EmptyBodyTable

This component has been removed and is part of the `Table` component.

Please see the contributors [documentation for the `Table` component](https://v5.contributor.strapi.io/exports/namespaces/Table) for more information.

### EmptyStateLayout

This component has been removed and not replaced. You should use `EmptyStateLayout` from `@strapi/design-system`:

```tsx
// Before
import { EmptyStateLayout } from '@strapi/helper-plugin';

// After
import { EmptyStateLayout } from '@strapi/design-system';
```

:::note
The props will be different. Please refer to the Strapi Design System [documentation for the `EmptyStateLayout` component](https://design-system-git-main-strapijs.vercel.app/?path=/docs/design-system-components-emptystatelayout--docs).
:::

### FilterListURLQuery

This component was moved to the `admin` package and can now be imported via the `@strapi/strapi` package as part of the composite component `Filters`:

```tsx
// Before
import { FilterListURLQuery } from '@strapi/helper-plugin';

const MyComponent = () => {
  return (
    <FilterListURLQuery filtersSchema={[{name: 'name', metadatas: {label: 'Name'}, fieldSchema: {type: 'string'}}]} />
  );
};


// After
import { Filters } from '@strapi/strapi/admin';

const MyComponent = () => {
  return (
    <Filters.Root>
      <Filters.List />
    </Filters.Root>
  );
};
```

### FilterPopoverURLQueryProps

This component was moved to the `admin` package and can now be imported via the `@strapi/strapi` package as part of the composite component `Filters`:

```tsx
// Before
import { FilterPopoverURLQueryProps } from '@strapi/helper-plugin';

// After
import { Filters } from '@strapi/strapi/admin';

const MyComponent = () => {
  return (
    <Filters.Root>
      <Filters.Trigger />
      <Filters.Popover />
    </Filters.Root>
  );
};
```

### Form

This component aliased `Formik`, something we're working towards removing. The `Form` component and its sibling exports from `@strapi/strapi/admin` should be used instead:

```tsx
// Before
import { Form } from '@strapi/helper-plugin';

// After
import { Form } from '@strapi/strapi/admin';
```

Users should note that any use of the Formik library will no longer work and instead should look at the contributors [documentation for the `Form` component](https://v5.contributor.strapi.io/exports/modules#form).

### GenericInput

This component has been removed and refactored to become the `InputRenderer` component exported from `@strapi/strapi/admin`. You should use the `InputRenderer` component from there:

```tsx
// Before
import { GenericInput } from '@strapi/helper-plugin';

const MyComponent = () => {
  return (
    <GenericInput
      type={'type'}
      hint={'hint'}
      label={'label'}
      name={'name'}
      onChange={onMetaChange}
      value={'value'}
    />
  );
};

// After
import { InputRenderer } from '@strapi/strapi/admin';
```

Note, that the `InputRenderer` component has a different API, and you should refer to the [documentation for the `InputRenderer` component](https://v5.contributor.strapi.io/exports/modules#inputrenderer).

### InjectionZone

This component has been removed and not replaced. However, you can easily replicate this in your own project by using the `useStrapiApp` hook:

```tsx
const MyComponent = ({ area, ...compProps }) => {
  const getPlugin = useStrapiApp('MyComponent', (state) => state.getPlugin);

  const [pluginName, page, position] = area.split('.');

  const plugin = getPlugin(pluginName);
  const components = plugin?.getInjectedComponents(page, position);

  if (!plugin || !components) {
    return null;
  }

  return components.map(({ name, Component }) => (
    <Component key={name} {...props} />
  ));
};
```

### Link

This was aliasing the design-system and using the `as` prop with `react-router-dom`. You should import the component from there:

```tsx
// Before
import { Link } from '@strapi/helper-plugin';

// After
import { Link } from '@strapi/design-system/v2';
import { NavLink } from 'react-router-dom';

const MyLink = () => {
  return (
    <Link as={NavLink} to="/my-link">
      My Link
    </Link>
  );
};
```

### LinkButton

This was aliasing the design-system and using the `as` prop with `react-router-dom`. You should import the component from there:

```tsx
// Before
import { LinkButton } from '@strapi/helper-plugin';

// After
import { LinkButton } from '@strapi/design-system/v2';
import { NavLink } from 'react-router-dom';

const MyLink = () => {
  return (
    <LinkButton as={NavLink} to="/my-link">
      My Link
    </LinkButton>
  );
};
```

### LoadingIndicatorPage

This component has been removed and refactored to be part of the `Page` component exported from `@strapi/strapi/admin`. You should use the `Page` component from there:

```tsx
// Before
import { LoadingIndicatorPage } from '@strapi/helper-plugin';

const MyPage = () => {
  // ...

  if (isLoading) {
    return <LoadingIndicatorPage />;
  }

  // ...
};

// After
import { Page } from '@strapi/strapi/admin';

const MyPage = () => {
  // ...

  if (isLoading) {
    return <Page.Loading />;
  }

  // ...
};
```

### NoContent

This component has been removed and not replaced, you should use the `EmptyStateLayout` component from `@strapi/design-system`.

```tsx
// Before
import { NoContent } from '@strapi/helper-plugin';

<NoContent
  content={{
    id: 'translation_id',
    defaultMessage: 'Message',
  }}
/>;

// After
import { EmptyStateLayout } from '@strapi/design-system';

<EmptyStateLayout
  content={{
    id: 'translation_id',
    defaultMessage: 'Message',
  }}
/>;
```

### NoMedia

This component has been removed and not replaced. If you feel like you need this component, please open an issue on the Strapi repository to discuss your usecase.

### NoPermissions

This component has been removed and refactored to be part of the `Page` component exported from `@strapi/strapi/admin`. You should use the `Page` component from there:

```tsx
// Before
import { NoPermissions } from '@strapi/helper-plugin';

const MyPage = () => {
  // ...

  if (!canRead) {
    return <NoPermissions />;
  }

  // ...
};

// After
import { Page } from '@strapi/strapi/admin';

const MyPage = () => {
  // ...

  if (!canRead) {
    return <Page.NoPermissions />;
  }

  // ...
};
```

### NotAllowedInput

This component has been removed and not replaced. If you feel like you need this component, please open an issue on the Strapi repository to discuss your usecase. You can easily replicate this in your own project by using the `TextInput` from `@strapi/design-system`:

```tsx
import { TextInput } from '@strapi/design-system';

const MyComponent = (props) => {
  return (
    <TextInput
      disabled
      placeholder="No permissions to see this field"
      type="text"
      {...props}
    />
  );
};
```

### PageSizeURLQuery

This component was moved to the `admin` package and can now be imported via the `@strapi/strapi` package as part of the composite component `Pagination`:

```tsx
// Before
import { PageSizeURLQuery } from '@strapi/helper-plugin';

const MyComponent = () => {
  return (
    <PageSizeURLQuery options={['12', '24', '50', '100']} defaultValue="24" />
  );
};

// After
import { Pagination } from '@strapi/strapi/admin';

const MyComponent = () => {
  return (
    <Pagination.Root>
      <Pagination.PageSize />
    </Pagination.Root>
  );
};
```

Note, there were some slightly behavioural changes i.e. the PageSize won't render if the lowest pageSize is 10 but you only have 9 entries. Due to the refactor some props will have moved and changed, please look at the contributors [documentation for the Pagination component](https://v5.contributor.strapi.io/exports/modules#table) for more information.

### PaginationURLQueryProps

This component was moved to the `admin` package and can now be imported via the `@strapi/strapi` package as part of the composite component `Pagination`:

```tsx
// Before
import { PaginationURLQueryProps } from '@strapi/helper-plugin';

// After
import { Pagination } from '@strapi/strapi/admin';

const MyComponent = () => {
  return (
    <Pagination.Root pageCount={2}>
      <Pagination.Links />
    </Pagination.Root>
  );
};
```

Note, there were some slightly behavioural changes i.e. the Links won't render if there are less than 2 pages. Due to the refactor some props will have moved and changed, please look at the [documentation for the Pagination component](https://v5.contributor.strapi.io/exports/modules#table) for more information.

### ReactSelect

This component has been removed and not replaced. If you feel like you need this component, please open an issue on the Strapi repository to discuss your usecase.

### RelativeTime

This component has been removed and not replaced. If you feel like you need this component, please open an issue on the Strapi repository to discuss your usecase.

### SearchURLQuery

This component was removed and renamed to `SearchInput` and can now be imported by the `@strapi/strapi` package:

```tsx
// Before
import { SearchURLQuery } from '@strapi/helper-plugin';

// After
import { SearchInput } from '@strapi/strapi/admin';
```

### SettingsPageTitle

This component has been removed and not replaced. If you feel like you need this component, please open an issue on the Strapi repository to discuss your usecase.

### Status

This component should be imported from the `@strapi/design-system` package:

```tsx
// Before
import { Status } from '@strapi/helper-plugin';

const MyComponent = () => {
  return (
    <Status variant={statusColor} showBullet={false} size="S">
      <Typography fontWeight="bold" textColor={`${statusColor}700`}>
        {stateMessage[status]}
      </Typography>
    </Status>
  );
};

// After
import { Status } from '@strapi/design-system';
```

### Table

This component should be imported from the `@strapi/strapi/admin` package:

```tsx
// Before
import { Table } from '@strapi/helper-plugin';

const MyComponent = () => {
  return (
    <Table colCount={2} rowCount={2}>
      <Thead>
        <Tr>
          <Th>
            <Typography variant="sigma" textColor="neutral600">
              {`Name`}
            </Typography>
          </Th>
          <Th>
            <Typography variant="sigma" textColor="neutral600">
              {`Description`}
            </Typography>
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {data?.map(({ name, description }) => {
          return (
            <Tr key={name}>
              <Td>
                <Typography textColor="neutral800" variant="omega" fontWeight="bold">
                  {name}
                </Typography>
              </Td>
              <Td>
                <Typography textColor="neutral800">
                  {description}
                </Typography>
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};


// After
import { Table } from '@strapi/strapi/admin';
```

:::note
Some of the props have changed, please refer to the contributors [documentation for the `Table` component](https://v5.contributor.strapi.io/exports/modules#table).
:::

## Content Manager

### contentManagementUtilRemoveFieldsFromData

This function has been removed and not replaced. If you feel like you need this function, please open an issue on the Strapi repository to discuss your usecase.

### formatContentTypeData

This function has been removed and not replaced. If you feel like you need this function, please open an issue on the Strapi repository to discuss your usecase.

### useCMEditViewDataManager

A lot of the internals have been reworked and split. We are exposing a main experimental hook to replace this one named `useContentManagerContext` while the rest of the logic is in several hooks.

```tsx
// Before
import { useCMEditViewDataManager } from '@strapi/helper-plugin';

// After
import { unstable_useContentManagerContext as useContentManagerContext } from '@strapi/strapi/admin/hooks';
```

Some common use cases are listed below:

```tsx
// Before
const { slug, isSingleType, isCreatingEntry, hasDraftAndPublished } =
  useCMEditViewDataManager();

// After
const {
  model,
  collectionType,
  id,
  slug,
  isCreatingEntry,
  isSingleType,
  hasDraftAndPublish,
} = useContentManagerContext();
```

- `allLayoutData` has been removed.

```tsx
// Before
const { layout, allLayoutData } = useCMEditViewDataManager();

// After
const { layout } = useContentManagerContext();

const {
  edit: { layout, components },
  list: { layout },
} = layout;
```

```tsx
// Before
const { initialData, modifiedData, onChange } = useCMEditViewDataManager();

// After
const { form } = useContentManagerContext();

const { initialValues, values, onChange } = form;
```

```tsx
// Before
const { onPublish, onUnpublish } = useCMEditViewDataManager();

// After
const { publish, unpublish } = useDocumentActions();
```

## Features

### AppInfo

This feature has been moved to `@strapi/admin` and only the hook `useStrapiApp` is now exported.

### AutoReloadOverlayBlocker

This feature has been removed and not replaced. If you feel like you need this feature, please open an issue on the Strapi repository to discuss your usecase.

### CustomFields

This feature has been removed and is part of the `useStrapiApp` hook.

### GuidedTour

This feature has been moved to `@strapi/admin` and only the hook `useGuidedTour` is now exported.

### Library

This feature has been removed and is part of the `useStrapiApp` hook.

### Notifications

This feature has been moved to the `@strapi/admin` package and only the `useNotifications` hook is exported. The `message` property
can no longer be a `TranslationMessage` and instead, only a string. If you were previously using the `warning` type you should instead
use the `danger` type and if you were using the `softWarning` type you should use `warning`. Finally, the return type is now an object.

```tsx
// Before
import { useNotification } from '@strapi/helper-plugin';

const toggleNotification = useNotification();

toggleNotification({
  type: 'warning',
  message: {
    id: 'my.message.id',
    defaultMessage: 'My message',
  },
});

// After
import { useNotification } from '@strapi/strapi/admin';

const { toggleNotification } = useNotification();

toggleNotification({
  type: 'danger',
  message: formatMessage({
    id: 'my.message.id',
    defaultMessage: 'My message',
  }),
});
```

### RBAC

This feature has removed and not replaced. If you need to access the user's permissions you should use the `useAuth` hook.

```tsx
// Before
import { useRBACProvider } from '@strapi/helper-plugin';

const { allPermission, refetchPermissions } = useRBACProvider();

// After
import { useAuth } from '@strapi/strapi/admin';

const permissions = useAuth('COMPONENT_NAME', (state) => state.permissions);
const refetchPermission = useAuth(
  'COMPONENT_NAME',
  (state) => state.refetchPermission
);
```

### OverlayBlocker

This feature has been removed and not replaced. If you feel like you need this feature, please open an issue on the Strapi repository to discuss your usecase.

### StrapiApp

This feature has been moved to `@strapi/admin` and only the hook `useStrapiApp` is now exported.

### Tracking

This feature has been moved to the `@strapi/admin` package and only the `useTracking` hook is exported.

## Hooks

### useAPIErrorHandler

This hook has been removed. You should import it from the `@strapi/strapi/admin` package:

```tsx
// Before
import { useAPIErrorHandler } from '@strapi/helper-plugin';

// After
import { useAPIErrorHandler } from '@strapi/strapi/admin';
```

### useCallbackRef

This hook has been removed. You should import it from the `@strapi/design-system` package:

```tsx
// Before
import { useCallbackRef } from '@strapi/helper-plugin';

// After
import { useCallbackRef } from '@strapi/design-system';
```

### useClipboard

This hook has been removed and not replaced. If you feel like you need this hook, please open an issue on the Strapi repository to discuss your usecase.

### useCollator

This hook has been removed. You should import it from the `@strapi/design-system` package:

```tsx
// Before
import { useCollator } from '@strapi/helper-plugin';

// After
import { useCollator } from '@strapi/design-system';
```

### useFetchClient

This hook has been removed. You should import it from the `@strapi/strapi/admin` package:

```tsx
// Before
import { useFetchClient } from '@strapi/helper-plugin';

// After
import { useFetchClient } from '@strapi/strapi/admin';
```

### useFieldHint

This hook has been removed and not replaced. If you feel like you need this hook, please open an issue on the Strapi repository to discuss your usecase.

### useFilter

This hook has been removed. You should import it from the `@strapi/design-system` package:

```tsx
// Before
import { useFilter } from '@strapi/helper-plugin';

// After
import { useFilter } from '@strapi/design-system';
```

### useFocusInputField

This hook has been removed and not replaced. If you feel like you need this hook, please open an issue on the Strapi repository to discuss your usecase.

### useFocusWhenNavigate

This hook has been removed and not replaced. If you feel like you need this hook, please open an issue on the Strapi repository to discuss your usecase.

### useFormattedMessage

This hook has been removed and not replaced. If you feel like you need this hook, please open an issue on the Strapi repository to discuss your usecase.

### useLockScroll

This hook has been removed and not replaced. If you feel like you need this hook, please open an issue on the Strapi repository to discuss your usecase.

### useQuery

This hook has been removed and not replaced. If you feel like you need this hook, please open an issue on the Strapi repository to discuss your usecase.

### useQueryParams

This hook has been moved. You should import it from the `@strapi/strapi/admin` package:

```tsx
// Before
import { useQueryParams } from '@strapi/helper-plugin';

// After
import { useQueryParams } from '@strapi/strapi/admin';
```

### useRBAC

This hook has been moved. You should import it from the `@strapi/strapi/admin` package:

```tsx
// Before
import { useRBAC } from '@strapi/helper-plugin';

// After
import { useRBAC } from '@strapi/strapi/admin';
```

### useSelectionState

This hook has been removed and not replaced. If you feel like you need this hook, please open an issue on the Strapi repository to discuss your usecase.

## Icons

### SortIcon

This component has been removed and not replaced. If you feel like you need this function, please open an issue on the Strapi repository to discuss your usecase.

### RemoveRoundedButton

This component has been removed and not replaced. If you feel like you need this function, please open an issue on the Strapi repository to discuss your usecase.

## Utils

### awaitToJs

This util has been removed and not replaced, use async / await with try / catch instead. If you feel like you need this util, please open an issue on the Strapi repository to discuss your usecase.

### difference

This util has been removed and not replaced. If you feel like you need this util, please open an issue on the Strapi repository to discuss your usecase.

### findMatchingPermissions

This util has been removed and not replaced. You should filter the permissions yourself. If you feel like you need this util, please open an issue on the Strapi repository to discuss your usecase.

### formatPermissionsForRequest

This util has been removed and not replaced. You should format the permissions yourself. If you feel like you need this util, please open an issue on the Strapi repository to discuss your usecase.

### getAPIInnerErrors

This util has been removed and not replaced, use async / await with try / catch instead. If you feel like you need this util, please open an issue on the Strapi repository to discuss your usecase.

### getFetchClient

This util has been removed. You should import it from the `@strapi/strapi/admin` package:

```tsx
// Before
import { getFetchClient } from '@strapi/helper-plugin';

// After
import { getFetchClient } from '@strapi/strapi/admin';
```

### getFileExtension

This util has been removed and not replaced. If you feel like you need this util, please open an issue on the Strapi repository to discuss your usecase.

### getYupInnerErrors

This util has been removed and not replaced. If you feel like you need this util, please open an issue on the Strapi repository to discuss your usecase.

### auth

This util has been removed and not replaced. If you're trying to interact with the token or current user you use should use the `useAuth` hook instead.
If you're generally interacting with localStorage, then access this directly e.g. `localStorage.getItem('myKey')`.

### hasPermissions

This util has been removed. If you need to use it, you should use the `checkUserHasPermissions` function from the `useAuth` hook.

```tsx
// Before
import { hasPermissions } from '@strapi/helper-plugin';


const permissions = await Promise.all(
  generalSectionRawLinks.map(({ permissions }) => hasPermissions(userPermissions, permissions))
);

// After
import { useAuth } from '@strapi/strapi/admin';

const { checkUserHasPermissions } = useAuth(
  'COMPONENT_NAME',
  (state) => state.checkUserHasPermissions
);
```

### normalizeAPIError

This util has been removed and not replaced. If you feel like you need this util, please open an issue on the Strapi repository to discuss your usecase.

### prefixFileUrlWithBackendUrl

This util has been removed and not replaced. Use the strapi backendUrl to prefix the relative url if you need. If you feel like you need this util, please open an issue on the Strapi repository to discuss your usecase.

### prefixPluginTranslations

This util has been removed and not replaced. Your plugin should define this util itself if needed, with an implementation like this:

```tsx
type TradOptions = Record<string, string>;

const prefixPluginTranslations = (
  trad: TradOptions,
  pluginId: string
): TradOptions => {
  if (!pluginId) {
    throw new TypeError("pluginId can't be empty");
  }
  return Object.keys(trad).reduce((acc, current) => {
    acc[`${pluginId}.${current}`] = trad[current];
    return acc;
  }, {} as TradOptions);
};
```

If you feel like you need this util, please open an issue on the Strapi repository to discuss your usecase.

### pxToRem

This util has been removed and not replaced. You should use directly this code in place of the pxToRem:

```tsx
// Before
pxToRem(
  32
) // After
`${32 / 16}rem`;
// or
('2rem');
```

If you feel like you need this util, please open an issue on the Strapi repository to discuss your usecase.

### request

This util has been removed and not replaced.
You can use `useFetchClient` from `@strapi/admin/strapi-admin`.

```tsx
// Before
import { request } from '@strapi/helper-plugin';

request(`/${pluginId}/settings/config`, { method: 'GET' });

// After
import { useFetchClient } from '@strapi/admin/strapi-admin';

const { get } = useFetchClient();
get(`/${pluginId}/settings/config`);
```

And you can use it like this

```tsx
const { get } = useFetchClient();

const { data } = await get(requestURL);
```

If you feel like you need this util, please open an issue on the Strapi repository to discuss your usecase.

### setHexOpacity

This util has been removed and not replaced, use the native CSS opacity property instead. If you feel like you need this util, please open an issue on the Strapi repository to discuss your usecase.

### stopPropagation

This util has been removed and not replaced. If you feel like you need this util, please open an issue on the Strapi repository to discuss your usecase.

### shouldCheckPermissions

This util has been removed and not replaced. If you feel like you need this util, please open an issue on the Strapi repository to discuss your usecase.

### translatedErrors

This utils has been removed. You should import it from the `@strapi/strapi/admin` package:

```tsx
// Before
import { translatedErrors } from '@strapi/helper-plugin';

// After
import { translatedErrors } from '@strapi/strapi/admin';
```

If you feel like you need this util, please open an issue on the Strapi repository to discuss your usecase.

### wrapAxiosInstance

This util has been removed and not replaced. If you feel like you need this util, please open an issue on the Strapi repository to discuss your usecase.
