
### Injection zones vs. Content Manager APIs

:::tip tl;dr
For adding panels, actions, or buttons to the Content Manager, the [Content Manager APIs](/cms/plugins-development/content-manager-apis) (`addDocumentAction`, `addEditViewSidePanel`, etc.) are often more robust and better typed than injection zones. Use injection zones when you need to insert components into specific UI areas not covered by the Content Manager APIs.
:::

Content Manager APIs and injection zones are both extension points to customize the admin panel, but they solve different needs:

| Need | Recommended API | Why |
| --- | --- | --- |
| Add a custom panel in the Edit View side area | Content Manager API ([`addEditViewSidePanel`](/cms/plugins-development/content-manager-apis#addeditviewsidepanel)) | Best for contextual information or controls that stay visible while editing. |
| Add actions in a document action menu | Content Manager API ([`addDocumentAction`](/cms/plugins-development/content-manager-apis#adddocumentaction)) | Best for document-level actions in the Edit View actions menu. |
| Add actions in the Edit View header | Content Manager API ([`addDocumentHeaderAction`](/cms/plugins-development/content-manager-apis#adddocumentheaderaction)) | Best for quick, prominent actions next to the document title. |
| Add actions for selected entries in List View | Content Manager API ([`addBulkAction`](/cms/plugins-development/content-manager-apis#addbulkaction)) | Best for workflows that apply to multiple entries at once. |
| Add UI to a predefined zone in a plugin view (localized visual customization) | Injection Zones API ([`injectComponent`](/cms/plugins-development/admin-injection-zones#injecting-into-content-manager-zones)) | Best when you target a specific zone exposed by a plugin. |

For implementation details and up-to-date API signatures, please refer to the [`content-manager` file in the Strapi codebase](https://github.com/strapi/strapi/blob/develop/packages/core/content-manager/admin/src/content-manager.ts).

<ExpandableContent>

**Mini examples (inside `bootstrap(app)`)**

```js
// Document action menu item
app.getPlugin('content-manager').apis.addDocumentAction(() => ({
  label: 'Run custom action',
  onClick: ({ documentId }) => runCustomAction(documentId),
}));

// Edit View header action
app.getPlugin('content-manager').apis.addDocumentHeaderAction(() => ({
  label: 'Open preview',
  onClick: ({ document }) => openPreview(document),
}));

// List View bulk action
app.getPlugin('content-manager').apis.addBulkAction(() => ({
  label: 'Bulk publish',
  onClick: ({ documentIds }) => bulkPublish(documentIds),
}));

// Edit View side panel
app.getPlugin('content-manager').apis.addEditViewSidePanel([
  {
    name: 'my-plugin.side-panel',
    Component: MySidePanel,
  },
]);

// Injection zone (plugin-defined zone)
app.injectContentManagerComponent('editView', 'right-links', {
  name: 'my-plugin.custom-link',
  Component: MyCustomLink,
});
```

</ExpandableContent>