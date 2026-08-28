:::note Draft & Publish
With [Draft & Publish](/cms/features/draft-and-publish) enabled, a PUT request without a `status` parameter publishes the changes immediately. Pass `?status=draft` to update the draft only (see [REST API: `status`](/cms/api/rest/status#create-update)). This also applies to single types, where <code>PUT {props.singleTypePath}</code> publishes the changes unless you pass `?status=draft`.
:::
