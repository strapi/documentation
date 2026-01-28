---
title: TEMPLATE — Configuration Title
sidebar_label: Configuration Title
displayed_sidebar: cmsSidebar
description: One-sentence summary of what this configuration controls.
tags:
  - configuration
---
# Template — Configuration Title

<Tldr>
What this setting does, when to change it, and risks.
</Tldr>

:::caution
If applicable, add a short warning (for example: “Changes require rebuilding the admin panel. Run `yarn build` or `npm run build`.\”).
:::

## Location
- Base file(s): `path: ./config/<area>.(js|ts)`
- Overrides: `path: ./config/env/{environment}/<area>.(js|ts)`
- Related env vars: see “Environment variables”.

## Available options
Describe each option briefly in a table and add an example.

| Parameter     | Description                          | Type     | Default   |
| ---           | ---                                  | ---      | ---       |
| `optionName`  | What it controls and caveats         | `String` | `'value'` |

```js title="path: ./config/<area>.js"
module.exports = {
  optionName: 'value',
};
```

## Environment variables
Document relevant variables and provide an example `.env`.

| Variable  | Purpose                         | Type     | Default |
| ---       | ---                             | ---      | ---     |
| `ENV_VAR` | What it toggles or configures   | `String` | `''`    |

```bash title=".env"
ENV_VAR=value
# …
```

:::tip
When exposing values to the admin app, prefer the `STRAPI_ADMIN_*` prefix.
:::

## Environment configurations
Show per‑environment overrides in JavaScript and TypeScript.

<Tabs groupId="js-ts">

<TabItem value="javascript" label="JavaScript">

```js title="path: ./config/<area>.js"
module.exports = ({ env }) => ({
  optionName: env('ENV_VAR', 'default'),
});
```

```js title="path: ./config/env/production/<area>.js"
module.exports = ({ env }) => ({
  optionName: env('ENV_VAR', 'prod-default'),
});
```

</TabItem>

<TabItem value="typescript" label="TypeScript">

```ts title="path: ./config/<area>.ts"
export default ({ env }) => ({
  optionName: env('ENV_VAR', 'default'),
});
```

```ts title="path: ./config/env/production/<area>.ts"
export default ({ env }) => ({
  optionName: env('ENV_VAR', 'prod-default'),
});
```

</TabItem>

</Tabs>

## Examples
Provide 1–2 common configurations with path‑hinted code fences.
