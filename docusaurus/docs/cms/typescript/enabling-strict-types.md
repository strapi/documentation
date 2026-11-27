---
title: Turning on strict types in an existing project
sidebar_label: Turning on strict types
description: Turn on strict types in an existing TypeScript Strapi project, fix the first type errors, and check that the build passes.
displayed_sidebar: cmsSidebar
tags:
  - typescript
  - guides
  - configuration
---

import StrictTypesBeta from '/docs/snippets/strict-types-beta.md'

# Turning on strict types in an existing project

<BetaBadge /> <VersionBadge version="5.xx.x" />

<Tldr>
Turn on strict types in an existing TypeScript Strapi project on version 5.xx.x or later. Set `strictTypes: true` in `config/typescript.ts`, generate the types, then fix the type errors until `tsc` and `strapi build` pass.
</Tldr>

<StrictTypesBeta />

This guide turns on [strict types](/cms/typescript/strict-types) in a TypeScript project created before strict types existed. Such a project has no `config/typescript.ts` file yet. At the end, the project type-checks against the contracts that Strapi and your application register, and `strapi build` passes.

:::prerequisites
- A TypeScript Strapi project on version 5.xx.x or later. To add TypeScript to a JavaScript project first, see [Adding TypeScript support](/cms/typescript/adding-support-to-existing-project).
- The `types/generated` folder is included in the TypeScript program: `tsconfig.json` does not exclude `types/generated/**`.
- A clean working tree in your version control system, so you can review the changes and revert them.
:::

## Steps

1. Open the `config/typescript.ts` file, or create it if it does not exist, and set `strictTypes` to `true`:

   ```ts title="/config/typescript.ts"
   import type { Core } from '@strapi/strapi';

   const config: Core.Config.TypeScript = {
     strictTypes: true,
   };

   export default config;
   ```

2. If your application runs with a license, list the features of that license in `licensedFeatures`, for instance `licensedFeatures: ['review-workflows']`. See [licensed features](/cms/typescript/strict-types#licensed-features) for the accepted values.

3. Generate the types:

   <Tabs groupId="yarn-npm">
   <TabItem value="yarn" label="Yarn">

   ```bash
   yarn strapi ts:generate-types
   ```

   </TabItem>
   <TabItem value="npm" label="NPM">

   ```bash
   npm run strapi ts:generate-types
   ```

   </TabItem>
   </Tabs>

   `types/generated/` then contains 6 more files, and the output shows no warning about `types/generated`.

4. Type-check the project. On an existing project, expect type errors: strict types check code that compiled with loose types before.

   <Tabs groupId="yarn-npm">
   <TabItem value="yarn" label="Yarn">

   ```bash
   yarn tsc --noEmit
   ```

   </TabItem>
   <TabItem value="npm" label="NPM">

   ```bash
   npx tsc --noEmit
   ```

   </TabItem>
   </Tabs>

5. Fix the reported errors, starting with the configuration and generated files, then the application contracts, then the document types. The [troubleshooting](#troubleshooting) section lists the most common errors and their fixes.

6. Run steps 3 and 4 again after each change to services, controllers, policies, middlewares, or content-types.

7. Build the project:

   <Tabs groupId="yarn-npm">
   <TabItem value="yarn" label="Yarn">

   ```bash
   yarn build
   ```

   </TabItem>
   <TabItem value="npm" label="NPM">

   ```bash
   npm run build
   ```

   </TabItem>
   </Tabs>

## Validation

Strict types are on when the following conditions are met:

- `types/generated/` contains `strict.d.ts`, `plugins.d.ts`, `services.ts`, `controllers.ts`, `policies.ts`, and `middlewares.ts`.
- The type generation output has no warning about `types/generated`.
- `tsc --noEmit` reports no error, and the build passes.

To check that types are strict:

1. Call a method on a misspelled service name in your code, for instance `strapi.service('api::article.articel').find()`.
2. Run `tsc --noEmit`. It reports a type error on that line.
3. Revert the change.

## <Icon name="bug" /> Troubleshooting {#troubleshooting}

The following symptoms are the most common after turning strict types on. The symptom is in bold, followed by what causes it and what to change:

- **`TS2571: Object is of type 'unknown'`, `TS18046`, or `TS2339` on a service lookup.** For an application service, the name is misspelled, or the types were not generated after the service was created: fix the name, then generate the types again. For a plugin service, the plugin does not publish its service contracts. Examples are local plugins, third-party plugins, and the Users & Permissions feature. Pass the expected type as a type argument, for instance `strapi.plugin('users-permissions').service<JwtService>('jwt')`. See [plugins without contracts](/cms/typescript/strict-types#plugins-without-contracts).
- **`TS18047: '…' is possibly 'null'` on a Document Service result.** Document Service results describe the runtime: a scalar attribute can be `null`, even when it is required. Handle the `null` case, for instance with `?? ''`. See [Document Service results and inputs](/cms/typescript/strict-types#document-service-results-and-inputs).
- **`TS2322: Type 'string' is not assignable to type 'Date'` on a date attribute.** Date and time attributes are strings in Document Service results. Parse them with `new Date(value)` where you need a `Date`.
- **`TS18046: 'strapi.config.server' is of type 'unknown'`.** Direct reads of the configuration are `unknown` with strict types. Use `strapi.config.get('server.url')` instead.
- **`TS2344` on `satisfies Core.ServiceFactory<uid>` or `Core.ControllerFactory<uid>`.** The module does not export a `ServiceContract` or `ControllerContract` type. Export the contract from the module. See [application contracts](/cms/typescript/strict-types#application-contracts).
- **`TS2339: Property '…' does not exist on type 'never'` on a licensed service.** The feature that provides the service is missing from `licensedFeatures`, so its lookup is typed `undefined`, and a `?.` or `if` check narrows it to `never`. Add the feature if your application runs with it, or remove the code.
- **`TS2820` on a permission action or a licensed feature.** The name is misspelled or not declared. Fix the name, or [declare the permission actions](/cms/typescript/strict-types#permission-actions) your application registers.
- **No strict type error at all, and a warning that starts with `typescript.strictTypes is on, but tsconfig.json leaves out types/generated/…`.** `tsconfig.json` excludes the generated files, so the project type-checks without strict types. Remove `types/generated/**` from the `exclude` array.
- **`ValidationError: Invalid config.typescript.strictTypes value`.** `strictTypes` is not a boolean. Set it to `true` or `false`.

## Turn strict types off

To turn strict types off, set `strictTypes` to `false` in `config/typescript.ts` or remove the key, then generate the types again. Type generation removes the 6 strict files, and the project type-checks as before.

:::strapi What to do next?
- Type your services and controllers with [application contracts](/cms/typescript/strict-types#application-contracts).
- [Declare the permission actions](/cms/typescript/strict-types#permission-actions) your application registers.
- Review the [limitations](/cms/typescript/strict-types#limitations) of strict types.
:::
