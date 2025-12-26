# Tabs component (language groups)

Use Tabs only when the same example exists in multiple language variants. Keep shared context above the Tabs and keep each variant minimal.

When to use
- Multiple language variants of the same example (do not use Tabs for a single-language snippet).
- Shared description and context appear above the Tabs (never prefix with “Description:” — write a normal sentence).

Allowed groups and values
- js-ts
  - order: JavaScript, then TypeScript
  - values: `js` and `ts`
  - labels: `JavaScript` and `TypeScript`
  - default: set `default` on the JavaScript `<TabItem>`
- yarn-npm
  - order: Yarn, then NPM
  - values: `yarn` and `npm`
  - labels: `Yarn` and `NPM`
  - default: set `default` on the Yarn `<TabItem>`

Code fence titles
- For file examples, use a plain file path in the `title` attribute (no `path:` prefix), e.g., `title="src/middlewares/response-time.js"`.
- For CLI/commands (install/run), omit `title` entirely (titles are only for file paths in this repository).

Canonical examples

## JavaScript/TypeScript variants (js-ts)

Add a response time header middleware.

<Tabs groupId="js-ts">
  <TabItem value="js" label="JavaScript" default>

```js title="src/middlewares/response-time.js"
module.exports = () => {
  return async (ctx, next) => {
    const start = Date.now();
    await next();
    const delta = Math.ceil(Date.now() - start);
    ctx.set('X-Response-Time', delta + 'ms');
  };
};
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts title="src/middlewares/response-time.ts"
export default () => {
  return async (ctx, next) => {
    const start = Date.now();
    await next();
    const delta = Math.ceil(Date.now() - start);
    ctx.set('X-Response-Time', `${delta}ms`);
  };
};
```

  </TabItem>
</Tabs>

## Install variants (yarn-npm)

Install and save the plugin dependency.

<Tabs groupId="yarn-npm">
  <TabItem value="yarn" label="Yarn" default>

```bash
yarn add @strapi/plugin-example
```

  </TabItem>
  <TabItem value="npm" label="NPM">

```bash
npm install @strapi/plugin-example
```

  </TabItem>
</Tabs>

Extraction and anchors
- llms-code groups variants under a single example; keep descriptions above Tabs.
- Use a clear H2/H3 heading directly above Tabs to provide a stable section anchor.
