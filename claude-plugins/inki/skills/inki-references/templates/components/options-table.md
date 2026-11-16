# Options table columns

Any table that lists configuration options or parameters (plugin options, configuration file parameters, command options) must include a `Type` column and a `Required` column.

## When to use

- Configuration pages (`cms/configurations/*`): the parameter tables.
- Plugin pages: the configuration options table.
- Any other page that lists the options a reader can set.

Not concerned: environment variable tables (`Variable`, `Purpose`, `Type`, `Default`), props tables of documentation components, and tables that are not about options (comparisons, troubleshooting).

## Columns

- `Type`: the value type, for instance `String`, `Boolean`, `Number`, `Object`, `Array`. Use code formatting when the page's existing tables do.
- `Required`: `Yes` or `No`. When an option is required only in some cases, write `No` and state the condition in the description.
- Keep the other columns the page type already uses. Insert `Required` right after `Type`:
  - Configuration pages: `Parameter | Description | Type | Required | Default`
  - Plugin pages: `Option | Type | Required | Description` (add `Default` after `Required` when options have defaults)

## Canonical example

```md
| Option | Type | Required | Description |
|---|---|---|---|
| `enabled` | Boolean | No | Turns the plugin on or off without uninstalling it. |
| `connection.apiKey` | String | Yes | API key for your provider. Keep it in the server environment only. |
```

## Rules

- A table of options without `Type` or `Required` is a structural error, not a style preference.
- Do not move the required/optional information into the description instead of the column.
