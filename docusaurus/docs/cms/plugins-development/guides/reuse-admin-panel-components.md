---
title: How to reuse built-in admin panel components in plugins
description: Learn how to access and reuse built-in Strapi admin panel React components, such as the Media Library dialog, in your custom admin components or plugins.
sidebar_label: Reuse admin panel components
displayed_sidebar: cmsSidebar
tags:
- admin panel
- components
- guides
- media library
- plugins
- plugins development
- plugins development guides
---

# How to reuse built-in admin panel components in plugins

<Tldr>
Built-in admin panel components are exposed through the component registry, which you read with the `useStrapiApp` hook. This guide uses the Media Library dialog (`MediaLibraryDialog`) as an example: access it from the registry, then render it to reuse Strapi's asset-selection dialog, optionally pre-selecting assets with the `initiallySelectedAssets` prop.
</Tldr>

When [developing a Strapi plugin](/cms/plugins-development/developing-plugins) or customizing the admin panel, you might want to reuse a React component that Strapi already ships in its admin panel instead of building your own. Built-in components are exposed through the admin panel's component registry, which you access with the `useStrapiApp` hook.

This guide uses the Media Library dialog (`MediaLibraryDialog`) as an example, but the same approach works for any component registered in the admin panel.

## Access a component from the registry

Built-in admin panel components are stored in the `components` object of the Strapi app context. Read it with the `useStrapiApp` hook, passing the name of the consuming component and a selector:

```jsx
import { useStrapiApp } from '@strapi/admin/strapi-admin';

const components = useStrapiApp('MyCustomComponent', (state) => state.components);
const MediaLibraryDialog = components['media-library'];
```

The first argument to `useStrapiApp` is a label identifying the consumer (used for error messages); the second is the selector that returns the part of the context you need.

## Reuse the Media Library dialog

The `MediaLibraryDialog` component opens the same asset-selection dialog used across the admin panel. It accepts the following props:

| Prop | Type | Description |
| --- | --- | --- |
| `onSelectAssets` | `(selectedAssets: File[]) => void` | Required. Called with the assets the user selected when they confirm their choice. |
| `onClose` | `() => void` | Required. Called when the dialog is closed. |
| `initiallySelectedAssets` | `File[]` | Optional. Media Library asset objects to pre-select when the dialog opens. |
| `allowedTypes` | `string[]` | Optional. Restricts the asset types that can be selected. Defaults to `['files', 'images', 'videos', 'audios']`. |
| `multiple` | `boolean` | Optional. Allows selecting several assets at once. Defaults to `true`. |

:::note
`initiallySelectedAssets` expects full Media Library asset objects (the same shape returned by the [Upload API](/cms/api/rest/upload)), not just an `id` and a `name`.
:::

The following example renders the dialog from a custom component and pre-selects assets when it opens:

```jsx
import { useState } from 'react';
import { useStrapiApp } from '@strapi/admin/strapi-admin';

export function MyCustomComponent() {
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const components = useStrapiApp('MyCustomComponent', (state) => state.components);
  const MediaLibraryDialog = components['media-library'];

  // Assets to pre-select when the dialog opens.
  // Each entry is a full Media Library asset object, not just an id and name.
  const initialAssets = [
    { id: 1, name: 'image1.jpg' /* ...other asset fields */ },
    { id: 2, name: 'image2.png' /* ...other asset fields */ },
  ];

  const handleSelectAssets = (assets) => {
    // Handle the assets the user selected
    console.log('Selected assets:', assets);
    setIsMediaLibraryOpen(false);
  };

  return (
    <>
      <button type="button" onClick={() => setIsMediaLibraryOpen(true)}>
        Open the Media Library
      </button>
      {isMediaLibraryOpen && (
        <MediaLibraryDialog
          initiallySelectedAssets={initialAssets}
          onSelectAssets={handleSelectAssets}
          onClose={() => setIsMediaLibraryOpen(false)}
        />
      )}
    </>
  );
}
```

Pre-selecting assets ensures that previously selected items are displayed when users open the Media Library dialog from your custom component.
