---
title: Design System Updates in Strapi 5
description: The Strapi Design System has been significantly updated in Strapi 5 with changes to component structure, APIs, and usage patterns.
sidebar_label: Design System Updates
displayed_sidebar: cmsSidebar
tags:
 - breaking changes
 - design system
 - upgrade to Strapi 5
---
import Intro from '/docs/snippets/breaking-change-page-intro.md'
import MigrationIntro from '/docs/snippets/breaking-change-page-migration-intro.md'

# The Strapi Design System has been upgraded to v2

The Strapi Design System has been completely updated in Strapi 5 with significant changes to component structure, APIs, and usage patterns.

<Intro />

<BreakingChangeIdCard
  plugins
/>

## Breaking change description

<SideBySideContainer>

<SideBySideColumn>

**In Strapi v4**

The Design System used a specific approach with direct imports, styled-components v5, and certain component APIs that have since been revised.

</SideBySideColumn>

<SideBySideColumn>

**In Strapi 5**

The Design System has been completely updated with a focus on accessibility, API consistency, and better typing support. Major changes include:

- Root imports instead of direct component paths
- Styled-components upgraded to v6
- Many components migrated to Radix-UI primitives
- New Field API for form elements
- TypeScript definitions now included
- Several components renamed or removed

</SideBySideColumn>
</SideBySideContainer>

## Migration

<MigrationIntro />

### Notes

- For detailed migration information, refer to <ExternalLink text="the Design System migration guide" to="https://design-system.strapi.io/?path=/docs/getting-started-migration-guides-v1-to-v2--docs"/>.
- The base font-size for the app is now `62.5%` (10px), so 1rem = 10px.
- Many icons have been updated or replaced.

Key changes to be aware of include the following:

#### Import structure changes

```diff
- import { Combobox } from '@strapi/design-system/Combobox';
+ import { Combobox } from '@strapi/design-system';
```

#### ThemeProvider migration

```diff
- import { ThemeProvider } from '@strapi/design-system';
+ import { DesignSystemProvider } from '@strapi/design-system';
```

#### Field components API changes

```diff
- return <SingleSelect label={label} error={error} required={required} value={value} onChange={handleChange} />;
+ return (
+   <Field.Root error={error} required={required} name={name}>
+     <Field.Label>{label}</Field.Label>
+     <SingleSelect value={value} onChange={handleChange} />
+     <Field.Error />
+     <Field.Hint />
+   </Field.Root>
+ );
```

#### Grid component structure

```diff
- import { Grid, GridItem } from '@strapi/design-system';
+ import { Grid } from '@strapi/design-system';

- <Grid gridCols={4}>
-   <GridItem col={2}>1</GridItem>
-   <GridItem col={2}>2</GridItem>
- </Grid>
+ <Grid.Root gridCols={4}>
+   <Grid.Item>1</Grid.Item>
+   <Grid.Item>2</Grid.Item>
+ </Grid.Root>
```

#### Component changes summary

- **Renamed components**: `ToggleInput` → `Toggle`
- **Removed components**: `Icon`, `Stack`, `ToggleCheckbox`, `Select/Option/OptGroup/SelectList` (use `SingleSelect` or `MultiSelect` instead)
- **Layout components moved to CMS**: Layout, MainNav, HeaderLayout, TwoColsLayout, GridLayout, ActionLayout, ContentLayout
- **New prop naming**: `as` is now `tag` for polymorphic components
- **Radix-UI migrations**: Many components including Accordion, Avatar, Checkbox, Dialog, Modal, Popover, Radio, Tabs, Tooltip

### Manual procedure

There is no codemod for this migration. Users will need to manually:

1. Update all Design System imports to use root imports.
2. Migrate component usages to the new APIs.
3. Update icon usage.
4. Replace Layout components with imports from `@strapi/admin/strapi-admin`.
5. Update styling to account for the new base font size.