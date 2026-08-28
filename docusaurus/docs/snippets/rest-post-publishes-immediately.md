:::note Draft & Publish
With [Draft & Publish](/cms/features/draft-and-publish) enabled, a POST request without a `status` parameter creates the {props.documentLabel || 'document'} and publishes it immediately. Pass `?status=draft` to create it as a draft (see [REST API: `status`](/cms/api/rest/status#create-update)).
:::
