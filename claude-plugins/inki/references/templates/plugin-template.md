---
title: TEMPLATE — Plugin Name
displayed_sidebar: cmsSidebar
description: One-sentence description of what the plugin adds.
tags:
  - plugins
---
# Template — Plugin Name

<Tldr>
What the plugin enables and when to use it.
</Tldr>

Use `<IdentityCard isPlugin>` with location, package, marketplace links.

## Installation
Show install commands (npm/yarn) and minimal version.

## Configuration
### Admin panel settings
Numbered steps and UI paths.

### Code-based configuration
```js title="path: config/plugins.(js|ts)"
module.exports = {
  'plugin-name': { enabled: true, config: {} },
};
```

## Usage
Explain how to use it post-setup; add API sub-sections if relevant. For API sub-sections, use the `<Endpoint>` component (`kind="http"` for REST, `kind="js"` for the Document Service), not the deprecated `<ApiCall>`/`<Request>`/`<Response>` trio. See `components/endpoint.md`.

<!-- Optional. Keep it when installation depends on something outside the project,
     such as registry access or a provider API key. One H3 per symptom, or a table
     when the cases are short. -->
## Troubleshooting
Symptom, then cause, then fix.

<!-- Optional. Keep it when removing the plugin takes more than deleting the
     package, for instance leftover configuration keys or data. -->
## Uninstallation
Steps to remove the plugin and anything it leaves behind.
