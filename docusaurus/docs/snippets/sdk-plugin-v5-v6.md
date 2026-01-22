:::caution Using SDK Plugin v5 (legacy)
If you need to continue using the previous build system with `@strapi/pack-up`, you can pin to version 5.x:

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="Yarn">

```bash
yarn add @strapi/sdk-plugin@5
```

</TabItem>
<TabItem value="npm" label="NPM">

```bash
npm install @strapi/sdk-plugin@5
```

</TabItem>
</Tabs>

Version 5.x of the SDK plugin supports `packup.config.ts` for custom build configuration. However, v6 is recommended for security updates and simplified configuration.
:::