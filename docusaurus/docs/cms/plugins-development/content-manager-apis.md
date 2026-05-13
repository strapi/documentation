---
title: Content Manager APIs
description: The Content Manager APIs reference lists the APIs available to plugins for adding actions and options to the Content Manager List view and Edit view.
pagination_prev: cms/plugins-development/admin-navigation-settings
pagination_next: cms/plugins-development/admin-injection-zones
displayed_sidebar: cmsSidebar
toc_max_heading_level: 4
tags:
- admin panel
- admin panel API
- admin panel customization
- plugins development
---

import Prerequisite from '/docs/snippets/plugins-development-create-plugin-prerequisite-admin-panel.md'
import InjectionVsCmApis from '/docs/snippets/injection-zones-vs-content-manager-apis.md'

# Content Manager APIs

<Tldr>
Content Manager APIs add panels, actions, and custom rich text blocks to the Content Manager through `addEditViewSidePanel`, `addDocumentAction`, `addDocumentHeaderAction`, `addBulkAction`, or `addRichTextBlocks`. Each API accepts component functions with typed contexts, enabling precise control over document-aware UI injections.
</Tldr>

Content Manager APIs are part of the [Admin Panel API](/cms/plugins-development/admin-panel-api). They are a way for Strapi plugins to add content or options to the [Content Manager](/cms/features/content-manager). The Content Manager APIs allow you to extend the Content Manager by adding functionality from your own plugin, just like you can do it with [Injection zones](/cms/plugins-development/admin-injection-zones).

<Prerequisite />

## General information

Strapi 5 provides 4 Content Manager APIs, all accessible through `app.getPlugin('content-manager').apis`. 
All the Content Manager APIs share the same API shape and must use components.

### Injection zones vs. Content Manager APIs

<InjectionVsCmApis/>

### API shape

All Content Manager APIs works in the same way: to use them, call them on your plugin's [`bootstrap()`](/cms/plugins-development/admin-panel-api#bootstrap) function, in 2 possible ways:

:::note
When using TypeScript, the `apis` property returned by `app.getPlugin()` is typed as `unknown`. Cast it to `ContentManagerPlugin['config']['apis']` before calling the APIs.
:::

- Passing an array with what you want to add. For example, the following code would add the ReleasesPanel at the end of the current EditViewSidePanels:

  <Tabs groupId="js-ts">
  <TabItem value="js" label="JavaScript" default>

    ```js
    const apis = app.getPlugin('content-manager').apis;

    apis.addEditViewSidePanel([ReleasesPanel]);
    ```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

    ```tsx
    import type { ContentManagerPlugin } from '@strapi/content-manager/strapi-admin';

    const apis =
      app.getPlugin('content-manager').apis as ContentManagerPlugin['config']['apis'];

    apis.addEditViewSidePanel([ReleasesPanel]);
    ```

  </TabItem>
  </Tabs>

- Passing a function that receives the current elements and return the new ones. This is useful if, for example, you want to add something in a specific position in the list, like in the following code:

  <Tabs groupId="js-ts">
  <TabItem value="js" label="JavaScript" default>

    ```js
    const apis = app.getPlugin('content-manager').apis;

    apis.addEditViewSidePanel((panels) => [SuperImportantPanel, ...panels]);
    ```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

    ```tsx
    const apis =
      app.getPlugin('content-manager').apis as ContentManagerPlugin['config']['apis'];

    apis.addEditViewSidePanel((panels) => [SuperImportantPanel, ...panels]);
    ```

  </TabItem>
  </Tabs>

### Components

You need to pass components to the API in order to add things to the Content Manager.

Components are functions that receive some properties and return an object with some shape (depending on the function). Each component's return object is different based on the function you're using, but they receive similar properties, depending on whether you use a ListView or EditView API.

Properties include important information about the document(s) you are viewing or editing.

#### ListViewContext

```jsx
interface ListViewContext {
  /**
   * Will be either 'single-types' | 'collection-types'
   */
  collectionType: string;
  /**
   * The current selected documents in the table
   */
  documents: Document[];
  /**
   * The current content-type's model.
   */
  model: string;
}
```

#### EditViewContext

```jsx
interface EditViewContext {
  /**
   * This will only be null if the content-type
   * does not have draft & publish enabled.
   */
  activeTab: 'draft' | 'published' | null;
  /**
   * Will be either 'single-types' | 'collection-types'
   */
  collectionType: string;
  /**
   * Will be undefined if someone is creating an entry.
   */
  document?: Document;
  /**
   * Will be undefined if someone is creating an entry.
   */
  documentId?: string;
  /**
   * Will be undefined if someone is creating an entry.
   */
  meta?: DocumentMetadata;
  /**
   * The current content-type's model.
   */
  model: string;
}
```

:::tip
More information about types and APIs can be found in <ExternalLink to="https://github.com/strapi/strapi/blob/develop/packages/core/content-manager/admin/src/content-manager.ts" text="Strapi's codebase, in the `/admin/src/content-manager.ts` file"/>.
:::

**Example:**

Adding a panel to the sidebar can be done as follows:

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript" default>

```jsx title="my-plugin/components/my-panel.js"
const Panel = ({ 
  activeTab, 
  collectionType, 
  document, 
  documentId, 
  meta, 
  model 
}) => {
  return {
    title: 'My Panel',
    content: <p>I'm on {activeTab}</p>
  }
}
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```tsx title="my-plugin/components/my-panel.ts"
import type { PanelComponent, PanelComponentProps } from '@strapi/content-manager/strapi-admin';

const Panel: PanelComponent = ({ 
  activeTab, 
  collectionType, 
  document, 
  documentId, 
  meta, 
  model 
}: PanelComponentProps) => {
  return {
    title: 'My Panel',
    content: <p>I'm on {activeTab}</p>
  }
}
```

</TabItem>
</Tabs>

## Available APIs

<br/>

### `addEditViewSidePanel`

Use this to add new panels to the Edit view sidebar, just like in the following example where something is added to the Releases panel:

![addEditViewSidePanel](/img/assets/content-manager-apis/add-edit-view-side-panel.png)

```jsx
addEditViewSidePanel(panels: DescriptionReducer<PanelComponent> | PanelComponent[])
```

#### PanelComponent

A `PanelComponent` receives the properties listed in [EditViewContext](#editviewcontext) and returns an object with the following shape:

```tsx
type PanelComponent = (props: PanelComponentProps) => {
  title: string;
  content: React.ReactNode;
};
```

`PanelComponentProps` extends the [EditViewContext](#editviewcontext).

### `addDocumentAction`

Use this API to add more actions to the Edit view or the List View of the Content Manager. There are 3 positions available:

- `header` of the Edit view:

    ![Header of the Edit view](/img/assets/content-manager-apis/add-document-action-header.png)
- `panel` of the Edit view:

    ![Panel of the Edit View](/img/assets/content-manager-apis/add-document-action-panel.png)
- `table-row` of the List view:

    ![Table-row in the List View](/img/assets/content-manager-apis/add-document-action-tablerow.png)

```jsx
addDocumentAction(actions: DescriptionReducer<DocumentActionComponent> | DocumentActionComponent[])
```

#### DocumentActionDescription

The interface and properties of the API look like the following: 

```jsx
interface DocumentActionDescription {
    label: string;
    onClick?: (event: React.SyntheticEvent) => Promise<boolean | void> | boolean | void;
    icon?: React.ReactNode;
    /**
     * @default false
     */
    disabled?: boolean;
    /**
     * @default 'panel'
     * @description Where the action should be rendered.
     */
    position?: DocumentActionPosition | DocumentActionPosition[];
    dialog?: DialogOptions | NotificationOptions | ModalOptions;
    /**
     * @default 'secondary'
     */
    variant?: ButtonProps['variant'];
    loading?: ButtonProps['loading'];
}

type DocumentActionPosition = 'panel' | 'header' | 'table-row' | 'preview' | 'relation-modal';

interface DialogOptions {
    type: 'dialog';
    title: string;
    content?: React.ReactNode;
    variant?: ButtonProps['variant'];
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void | Promise<void>;
}
interface NotificationOptions {
    type: 'notification';
    title: string;
    link?: {
        label: string;
        url: string;
        target?: string;
    };
    content?: string;
    onClose?: () => void;
    status?: NotificationConfig['type'];
    timeout?: number;
}
interface ModalOptions {
    type: 'modal';
    title: string;
    content: React.ComponentType<{
        onClose: () => void;
    }> | React.ReactNode;
    footer?: React.ComponentType<{
        onClose: () => void;
    }> | React.ReactNode;
    onClose?: () => void;
}
```

### `addDocumentHeaderAction`

Use this API to add more actions to the header of the Edit view of the Content Manager:

![addEditViewSidePanel](/img/assets/content-manager-apis/add-document-header-action.png)

```jsx
addDocumentHeaderAction(actions: DescriptionReducer<HeaderActionComponent> | HeaderActionComponent[])
```

#### HeaderActionDescription

The interface and properties of the API look like the following:

```jsx
interface HeaderActionDescription {
  disabled?: boolean;
  label: string;
  icon?: React.ReactNode;
  type?: 'icon' | 'default';
  onClick?: (event: React.SyntheticEvent) => Promise<boolean | void> | boolean | void;
  dialog?: DialogOptions;
  options?: Array<{
    disabled?: boolean;
    label: string;
    startIcon?: React.ReactNode;
    textValue?: string;
    value: string;
  }>;
  onSelect?: (value: string) => void;
  value?: string;
}

interface DialogOptions {
  type: 'dialog';
  title: string;
  content?: React.ReactNode;
  footer?: React.ReactNode;
}
```

### `addBulkAction`

Use this API to add buttons that show up when entries are selected on the List View of the Content Manager, just like the "Add to Release" button for instance:

![addEditViewSidePanel](/img/assets/content-manager-apis/add-bulk-action.png)

```jsx
addBulkAction(actions: DescriptionReducer<BulkActionComponent> | BulkActionComponent[])
```

#### BulkActionDescription

The interface and properties of the API look like the following: 

```jsx
interface BulkActionDescription {
  dialog?: DialogOptions | NotificationOptions | ModalOptions;
  disabled?: boolean;
  icon?: React.ReactNode;
  label: string;
  onClick?: (event: React.SyntheticEvent) => void;
  /**
   * @default 'default'
   */
  type?: 'icon' | 'default';
  /**
   * @default 'secondary'
   */
  variant?: ButtonProps['variant'];
}
```

### `addRichTextBlocks`

Use this API to register custom block types in the [Blocks](/cms/features/content-manager) rich text field. Custom blocks appear in the toolbar dropdown alongside built-in ones.

:::note
`addRichTextBlocks` must be called in the `register()` lifecycle function, not `bootstrap()`. The editor initializes its Slate instance during `register`, so blocks must be available at that point.
:::

```jsx
addRichTextBlocks(blocks: RichTextBlocksStore | ((currentBlocks: RichTextBlocksStore) => RichTextBlocksStore))
```

The API accepts 2 call signatures:

- Passing an **object**: the provided blocks are merged into the existing blocks store.

  <Tabs groupId="js-ts">
  <TabItem value="js" label="JavaScript" default>

  ```js title="src/admin/app.js"
  export default {
    register(app) {
      app.getPlugin('content-manager').apis.addRichTextBlocks({
        callout: {
          renderElement: (props) => <Callout {...props.attributes}>{props.children}</Callout>,
          icon: Information,
          label: { id: 'my-plugin.blocks.callout', defaultMessage: 'Callout' },
          matchNode: (node) => node.type === 'callout',
          isInBlocksSelector: true,
          handleConvert(editor) { /* use Slate Transforms to set node type */ },
          snippets: [':::callout'],
        },
      });
    },
  };
  ```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

  ```tsx title="src/admin/app.ts"
  import type { ContentManagerPlugin } from '@strapi/content-manager/strapi-admin';

  export default {
    register(app) {
      const apis =
        app.getPlugin('content-manager').apis as ContentManagerPlugin['config']['apis'];

      apis.addRichTextBlocks({
        callout: {
          renderElement: (props) => <Callout {...props.attributes}>{props.children}</Callout>,
          icon: Information,
          label: { id: 'my-plugin.blocks.callout', defaultMessage: 'Callout' },
          matchNode: (node) => node.type === 'callout',
          isInBlocksSelector: true,
          handleConvert(editor) { /* use Slate Transforms to set node type */ },
          snippets: [':::callout'],
        },
      });
    },
  };
  ```

  </TabItem>
  </Tabs>

- Passing a **function**: the function receives the current blocks store and must return the updated store. Use this form to remove or replace built-in blocks.

  <Tabs groupId="js-ts">
  <TabItem value="js" label="JavaScript" default>

  ```js title="src/admin/app.js"
  export default {
    register(app) {
      app.getPlugin('content-manager').apis.addRichTextBlocks((currentBlocks) => {
        // Remove the built-in code block
        const { code: _removed, ...rest } = currentBlocks;
        return rest;
      });
    },
  };
  ```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

  ```tsx title="src/admin/app.ts"
  import type {
    ContentManagerPlugin,
    RichTextBlocksStore,
  } from '@strapi/content-manager/strapi-admin';

  export default {
    register(app) {
      const apis =
        app.getPlugin('content-manager').apis as ContentManagerPlugin['config']['apis'];

      apis.addRichTextBlocks((currentBlocks: RichTextBlocksStore) => {
        const { code: _removed, ...rest } = currentBlocks;
        return rest;
      });
    },
  };
  ```

  </TabItem>
  </Tabs>

#### Block definition

Each entry in the blocks object is a block definition with the following properties:

| Property | Required | Type | Description |
|---|---|---|---|
| `renderElement` | Yes | `React.FC` | React render function. Spread `props.attributes` on the root element and render `props.children`. |
| `matchNode` | Yes | `(node: Node) => boolean` | Returns `true` if a given <ExternalLink text="Slate" to="https://docs.slatejs.org/" /> node belongs to this block type. |
| `isInBlocksSelector` | No | `boolean` | Set to `true` to show the block in the toolbar dropdown. Defaults to `false`. |
| `icon` | No | `React.ComponentType` | Icon component shown in the toolbar dropdown. Required when `isInBlocksSelector` is `true`. |
| `label` | No | `{ id: string, defaultMessage: string }` | `MessageDescriptor` shown in the toolbar dropdown. Required when `isInBlocksSelector` is `true`. |
| `handleConvert` | No | `(editor: Editor) => void \| (() => React.JSX.Element)` | Called when the user selects this block from the dropdown. Use Slate's `Transforms` to set the node type. Can return a React element factory to render a modal. |
| `handleEnterKey` | No | `(editor: Editor) => void` | Custom Enter key behavior inside this block. |
| `handleBackspaceKey` | No | `(editor: Editor, event: React.KeyboardEvent<HTMLElement>) => void` | Custom Backspace key behavior. |
| `handleTab` | No | `(editor: Editor) => void` | Custom Tab key behavior (e.g., indentation). |
| `handleShiftTab` | No | `(editor: Editor) => void` | Custom Shift+Tab key behavior. |
| `snippets` | No | `string[]` | Typing one of these strings followed by Space triggers a conversion to this block type. |
| `dragHandleTopMargin` | No | `string` | Adjusts the vertical position of the drag-to-reorder grip icon. |
| `plugin` | No | `(editor: Editor) => Editor` | A <ExternalLink text="Slate plugin" to="https://docs.slatejs.org/" /> registered when the editor instance is created. Use this for custom normalizers or Slate-level behavior. |
| `isDraggable` | No | `(element: Element) => boolean` | Function returning whether a given element is draggable. Defaults to `() => true`. |

The built-in block keys are: `paragraph`, `heading-one`, `heading-two`, `heading-three`, `heading-four`, `heading-five`, `heading-six`, `list-ordered`, `list-unordered`, `image`, `quote`, `code`, `link`, `list-item`.

**Key handler example**

Key handlers each receive the Slate `editor` instance. Use Slate's `Transforms` API to modify the document:

```js
callout: {
  // ...
  handleEnterKey(editor) {
    // Exit the block on Enter and insert a new paragraph below
    Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: '' }] });
  },
  handleBackspaceKey(editor, event) {
    // Convert back to paragraph when backspacing in an empty callout
    Transforms.setNodes(editor, { type: 'paragraph' });
  },
  handleTab(editor) {
    // Increase indentation level on Tab
    Transforms.setNodes(editor, { indent: (editor.selection ? 1 : 0) });
  },
  handleShiftTab(editor) {
    // Decrease indentation level on Shift+Tab
    Transforms.setNodes(editor, { indent: 0 });
  },
},
```

:::tip
More information about types can be found in <ExternalLink to="https://github.com/strapi/strapi/blob/develop/packages/core/content-manager/admin/src/pages/EditView/components/FormInputs/BlocksInput/BlocksEditor.tsx" text="Strapi's codebase, in the BlocksEditor.tsx file"/>.
:::