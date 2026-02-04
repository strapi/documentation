---
title: Feature name
displayed_sidebar: cmsSidebar
description: One-sentence summary of what this feature enables.
tags:
  - features
  - <keyword-1>
  - <keyword-2>
---
# Feature name

<Tldr>
State what the feature does, why it matters, and a primary use case in 1–3 sentences.
</Tldr>

Introduce the feature in 1–2 short paragraphs: the problem it solves, where it lives in the product, and how it relates to neighboring features. Prefer paragraphs over bullet points unless listing discrete options or variants.

<Guideflow lightId="<light-id>" darkId="<dark-id>" />

<IdentityCard>
  <IdentityCardItem icon="credit-card" title="Plan">Free feature</IdentityCardItem>
  <IdentityCardItem icon="user" title="Role & permission">None</IdentityCardItem>
  <IdentityCardItem icon="toggle-right" title="Activation">Available and activated by default</IdentityCardItem>
  <IdentityCardItem icon="desktop" title="Environment">Available in both Development & Production environment</IdentityCardItem>
  <!-- Adjust values above to match the feature -->
</IdentityCard>

## Configuration

Start with a brief paragraph explaining what needs to be configured and where, then split UI and code setup.

### Admin panel configuration
Explain where to configure the feature in the admin panel, using a short, clear paragraph, followed by minimal steps only if necessary.

<ThemedImage
  alt="Screenshot describing the configuration"
  sources={{
    light: '/img/features/<feature>-light.png',
    dark: '/img/features/<feature>-dark.png',
  }}
/>

### Code-based configuration
Use path-hinted code fences. Prefer paragraphs; use bullets only to enumerate discrete options.

```js title="path: ./config/<area>.js"
// Minimal configuration illustrating the feature
module.exports = {
  optionName: 'value',
};
```

<Tabs groupId="js-ts">
  <TabItem value="js" label="JavaScript" default>

```js title="path: ./src/<feature>/index.js"
// JS example
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts title="path: ./src/<feature>/index.ts"
// TS example
```

  </TabItem>
</Tabs>

:::note
If the feature requires rebuilding the admin panel, mention it: run `yarn build` or `npm run build`.
:::

## Usage

Introduce how to perform the most common tasks with a paragraph. Use H3 task sections when it improves clarity.

### Task 1: Describe a core task
Explain the goal and the context. Prefer a paragraph; only use bullets to list choices or variants.

```bash title="Example"
curl https://example/...
```

### Task 2: Describe another core task
Keep instructions concise and outcome‑oriented; include a focused example if helpful.

```bash title="Example"
# minimal, focused example
```