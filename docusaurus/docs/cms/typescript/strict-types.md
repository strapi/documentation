---
title: Strict types
description: Opt in to strict server types that check service lookups, documents, routes, and permission actions against registered contracts.
displayed_sidebar: cmsSidebar
tags:
  - typescript
  - configuration
  - types
---

import StrictTypesBeta from '/docs/snippets/strict-types-beta.md'

# Strict types

<BetaBadge /> <VersionBadge version="5.xx.x" />

<Tldr>
Strict types are an opt-in TypeScript mode, enabled with `strictTypes: true` in `config/typescript.ts`. Server lookups, Document Service results and inputs, route references, and permission action IDs are then checked against the contracts that Strapi, its packages, and your application register.
</Tldr>

<StrictTypesBeta />

By default, many server APIs of a [TypeScript](/cms/typescript) Strapi project return loose types. For instance, `strapi.service('api::article.article')` returns a generic service. A misspelled service name, or a call to a missing method, compiles without error. With strict types, [type generation](/cms/typescript/development#generate-typings-for-content-types-schemas) also registers your application's services, controllers, policies, and middlewares. TypeScript then checks your code against these registered types, called contracts, and against the contracts of the bundled Strapi packages.

Strict types do not change runtime behavior, and they are not the TypeScript compiler `strict` option set in `tsconfig.json`. They only change the types that Strapi provides to your project.

This page explains how to turn strict types on, what they check, how to write contracts for your own code, and their current limitations.

## Turn strict types on

To turn strict types on, set `strictTypes` to `true` in the [TypeScript configuration file](/cms/configurations/typescript#strapi-specific-configuration-for-typescript). New TypeScript projects already have this file, with `strictTypes: false`:

```ts title="/config/typescript.ts"
import type { Core } from '@strapi/strapi';

const config: Core.Config.TypeScript = {
  strictTypes: true,
};

export default config;
```

Then generate the types and check the project. A strict type error stops `strapi build`, because the `tsconfig.json` of Strapi projects sets `noEmitOnError`:

<Tabs groupId="yarn-npm">
<TabItem value="yarn" label="Yarn">

```bash
yarn strapi ts:generate-types
yarn tsc --noEmit
```

</TabItem>
<TabItem value="npm" label="NPM">

```bash
npm run strapi ts:generate-types
npx tsc --noEmit
```

</TabItem>
</Tabs>

`strapi develop` also generates the types each time it starts.

To turn strict types on in an existing project and fix the first errors, follow the [dedicated guide](/cms/typescript/enabling-strict-types).

### Generated files

With strict types, type generation writes 6 more files in `types/generated/`, next to `contentTypes.d.ts` and `components.d.ts`:

| File | Purpose |
| --- | --- |
| `strict.d.ts` | Turns strict types on for the program and declares the [licensed features](#licensed-features) of the application. |
| `plugins.d.ts` | Loads the type declarations of the installed plugins. |
| `services.ts` | Registers the services of the application. |
| `controllers.ts` | Registers the controllers of the application. |
| `policies.ts` | Registers the policies of the application and their configuration. |
| `middlewares.ts` | Registers the middlewares of the application and their configuration. |

Do not edit these files: each type generation rewrites them.

:::caution
Keep `types/generated` in the TypeScript program. If `tsconfig.json` excludes it, the project type-checks without strict types and reports no error. Type generation then logs a warning that starts with `typescript.strictTypes is on, but tsconfig.json leaves out types/generated/…`.
:::

### Licensed features

Some services and controllers only exist when Strapi runs with a license that includes their feature, for instance review workflows or content releases. With strict types, an application that runs with a license lists the features of that license in `licensedFeatures`:

```ts title="/config/typescript.ts"
import type { Core } from '@strapi/strapi';

const config: Core.Config.TypeScript = {
  strictTypes: true,
  licensedFeatures: ['review-workflows', 'cms-content-releases'],
};

export default config;
```

The list accepts `'review-workflows'`, `'cms-content-releases'`, `'cms-content-history'`, `'cms-advanced-preview'`, `'cms-ai'`, `'cms-byok-ai'`, `'sso'`, `'audit-logs'`, and `'licensed'`. Use `'licensed'` alone for a license with no feature. A misspelled feature name is a type error.

The contracts of the features you do not list are typed `undefined`. Type generation follows the list, not the license Strapi boots with, and logs a warning when they disagree. List the features of the license your application runs with. The types cannot verify that license.

### Turn strict types off

To turn strict types off, set `strictTypes` to `false` or remove the key, then generate the types again. Type generation removes the 6 strict files listed above, and `types/generated` is the same as in a project that never turned strict types on.

## Typed service and configuration lookups

With strict types, the following lookups return the registered contract instead of a loose type:

- `strapi.service()`, `strapi.controller()`, `strapi.policy()`, and `strapi.middleware()`
- `strapi.plugin(name).service()`
- `strapi.config.get()`
- `strapi.store()`, `strapi.eventHub`, and `strapi.get()`

Your code editor autocompletes the registered names, and a wrong argument is a type error. A misspelled name returns `unknown`, so using its result is a type error.

The following example calls the service of the bundled Email plugin:

```ts title="/src/index.ts"
import type { Core } from '@strapi/strapi';

export default {
  register() {},
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await strapi.plugin('email').service('email').send({
      to: 'editor@example.com',
      subject: 'Strapi started',
      text: `Strapi runs at ${strapi.config.get('server.url')}`,
    });

    // @ts-expect-error `to` is required.
    await strapi.plugin('email').service('email').send({ subject: 'Strapi started' });
  },
};
```

A direct read of the configuration, such as `strapi.config.server`, is `unknown` with strict types. Read the configuration with `strapi.config.get('server.url')` instead.

### Plugins without contracts

A plugin that does not publish its service contracts has `unknown` service lookups. This includes local plugins (`src/plugins/*`), most third-party plugins, and the services of the Users & Permissions feature until <ExternalLink to="https://github.com/strapi/strapi/pull/27928" text="strapi/strapi#27928"/> adds their contracts. Using an `unknown` lookup is a type error (`TS2571`, `TS18046`, or `TS2339`).

To type such a lookup, pass the type you expect as a type argument:

```ts title="/src/index.ts"
import type { Core } from '@strapi/strapi';

type JwtService = {
  issue(payload: object): string;
};

export default {
  register() {},
  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const token = strapi.plugin('users-permissions').service<JwtService>('jwt').issue({ id: 1 });
    strapi.log.debug(`Issued a token of ${token.length} characters`);
  },
};
```

`strapi.plugin(name).service<T>(name)` compiles with strict types on and off.

## Application contracts

Type generation registers each service and controller of `src/api`. To decide what `strapi.service(uid)` and `strapi.controller(uid)` return, export a type named `ServiceContract` or `ControllerContract` from the module. Then check the factory against it with `satisfies Core.ServiceFactory<uid>` or `satisfies Core.ControllerFactory<uid>`.

The following service adds a `findPublishedTitles()` method to the core service of the `article` content-type. The `null` check is needed because [Document Service results](#document-service-results-and-inputs) can hold `null` values:

```ts title="/src/api/article/services/article.ts"
import { factories, type Core } from '@strapi/strapi';

export type ServiceContract = Core.CoreAPI.Service.ContentType<'api::article.article'> & {
  findPublishedTitles(): Promise<string[]>;
};

export default factories.createCoreService('api::article.article', ({ strapi }) => ({
  async findPublishedTitles() {
    const articles = await strapi
      .documents('api::article.article')
      .findMany({ status: 'published', fields: ['title'] });

    return articles
      .map((article) => article.title)
      .filter((title): title is string => title !== null);
  },
})) satisfies Core.ServiceFactory<'api::article.article'>;
```

A controller then calls the custom method with full type checking:

```ts title="/src/api/article/controllers/article.ts"
import { factories, type Core } from '@strapi/strapi';

export type ControllerContract = Core.CoreAPI.Controller.ContentType<'api::article.article'> & {
  titles: Core.ControllerHandler<string[]>;
};

export default factories.createCoreController('api::article.article', ({ strapi }) => ({
  async titles() {
    return strapi.service('api::article.article').findPublishedTitles();
  },
})) satisfies Core.ControllerFactory<'api::article.article'>;
```

The following rules apply to contracts:

- Without a contract export, type generation registers the type that the factory returns. `satisfies Core.ServiceFactory<uid>` and `satisfies Core.ControllerFactory<uid>` then fail with `TS2344`.
- A `createCoreService` factory that overrides core methods without a `ServiceContract` export keeps the loose signatures of these methods.
- To share a contract between modules, write it in a file outside the `services/` and `controllers/` folders. Strapi loads every file of these folders as a service or a controller.

## Document Service results and inputs

With strict types, the results of the [Document Service API](/cms/api/document-service) and of core services describe what Strapi returns at runtime:

- Every selected scalar attribute is present, and can be `null`, even when the attribute is required.
- Unpopulated relations, media, components, and dynamic zones are absent. Populated to-many relations are arrays.
- Date and time attributes are strings.
- A populated media field is a document of the `plugin::upload.file` content-type.
- `publishedAt` follows the `status` of the call.

The following example reads a field and a populated media field:

```ts title="/src/utils/read-articles.ts"
import type { Core } from '@strapi/strapi';

export const readArticles = async (strapi: Core.Strapi) => {
  const articles = await strapi.documents('api::article.article').findMany({
    fields: ['title'],
    populate: { cover: { fields: ['url'] } },
    status: 'published',
  });

  const first = articles[0];
  const title: string | null | undefined = first?.title;
  const coverUrl: string | null | undefined = first?.cover?.url;

  return { title, coverUrl };
};
```

The `data` of `create()`, `update()`, and `clone()` follows the rules of the entity validator, and a wrong value type is a type error. Required attributes depend on the status. A draft only needs its required repeatable components and dynamic zones. A published entry, or an entry of a content-type without Draft & Publish, also needs the other required attributes, except relations, media, and attributes with a default value.

Params passed as-is from `ctx.query` to `findMany()` or `findFirst()` give an open result: `id` and `documentId` are present, and every other attribute is optional, because the client decides what to populate.

[Document Service middlewares](/cms/api/document-service/middlewares) are typed with strict types on and off: checking `context.action` narrows `context.params` to the parameters of that action.

## Routes, policies, and middlewares

Type generation registers each policy and middleware of the application with the configuration type it accepts. Type the configuration with `Core.PolicyHandler<Config>` or `Core.MiddlewareFactory<Config>`:

```ts title="/src/policies/has-role.ts"
import type { Core } from '@strapi/strapi';

export default ((policyContext, config) => {
  return config.roles.includes(policyContext.request.get('x-role'));
}) satisfies Core.PolicyHandler<{ roles: string[] }>;
```

A route configuration with `satisfies Core.RouteConfigFor` then checks the policy and middleware names and their configuration:

```ts title="/src/api/article/routes/custom-article.ts"
import type { Core } from '@strapi/strapi';

const editorOnly = {
  policies: [{ name: 'global::has-role', config: { roles: ['editor'] } }],
} satisfies Core.RouteConfigFor;

export default {
  routes: [
    {
      method: 'GET',
      path: '/articles/titles',
      handler: 'api::article.article.titles',
      config: editorOnly,
    },
  ],
};
```

These checks are opt-in. Route files without `satisfies Core.RouteConfigFor` and the `config` of `createCoreRouter` stay unchecked, so turning strict types on adds no error to existing routes. TypeScript also checks the entries of `config/middlewares.ts` when you type its export with `Core.Config.Middlewares`, as new projects do.

## Permission actions

With strict types, the permission actions named in typed configurations, such as the `actions` of the `admin::hasPermissions` policy, only accept declared action IDs. Declare the actions your application registers from the `as const` list that you pass to `registerMany()`:

```ts title="/src/index.ts"
import type { Core } from '@strapi/strapi';

const actions = [
  { section: 'settings', category: 'reports', displayName: 'Export reports', uid: 'report.export' },
] as const;

declare global {
  namespace Strapi.Registries {
    interface PermissionActions extends Core.PermissionActionsOf<typeof actions> {}
  }
}

export default {
  register() {},
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await strapi.service('admin::permission').actionProvider.registerMany(actions);
  },
};
```

Strapi prefixes the `uid` of an application action with `api::`. The declared ID, `api::report.export`, is then accepted in a route configuration, and a misspelled ID fails with `TS2820`. The list must be `as const`: without it, `registerMany()` does not compile.

## Database lifecycles

A content-type `lifecycles.ts` file can check its hooks with `satisfies Core.Lifecycles<uid>`. Each hook then receives an event typed from the content-type schema:

```ts title="/src/api/article/content-types/article/lifecycles.ts"
import type { Core } from '@strapi/strapi';

export default {
  afterCreate(event) {
    strapi.log.debug(`Created article ${event.result.documentId}`);
  },
} satisfies Core.Lifecycles<'api::article.article'>;
```

`strapi.db.lifecycles.subscribe()` types its hooks from the `models` it lists. The values of `event.params.data` and `event.params.where` stay `unknown`: narrow them at runtime.

## Plugins and shared code

Code shared between projects, such as a plugin or a library, must compile with strict types on and off. Compile it in both modes, and watch for the following differences:

- Callback parameters: strict contracts type them from the context. Without strict types, they are implicitly `any` (`TS7006`, `TS7031`). Annotate them.
- Policy references: without strict types, the object form requires `config`. Reference a policy by name alone, or write `{ name, config: {} }`.
- Populated to-many relations: without strict types, they can be `null` or `undefined` (`TS18049`). Write `(article.tags ?? []).length`.

Plugins can also publish their own contracts, so that applications get typed lookups for their services. This is documented for contributors in the <ExternalLink to="https://github.com/strapi/strapi/blob/feat/strict-types-exploration/docs/docs/contributing/05-typescript.md#declaring-a-packages-contracts" text="Strapi TypeScript contributor guide"/>.

## Sharing types with front-end applications

A front-end application or a shared types package can include `types/generated/contentTypes.d.ts` and `types/generated/components.d.ts`. These files are typed as without strict types.

Do not share the other generated files: `strict.d.ts`, `plugins.d.ts`, `services.ts`, `controllers.ts`, `policies.ts`, and `middlewares.ts` load the server code of the application and of its plugins, and only compile next to it.

## Limitations

Strict types are in beta and do not cover the following cases yet:

- Request input: `ctx.request.body`, `ctx.params`, and `ctx.state.user` stay `any`, so request data passes strict contracts unchecked. Validate and [sanitize](/cms/backend-customization/controllers#sanitization-and-validation-in-controllers) request input yourself.
- Users & Permissions services: lookups are `unknown` until <ExternalLink to="https://github.com/strapi/strapi/pull/27928" text="strapi/strapi#27928"/> is released. Pass a type argument (see [plugins without contracts](#plugins-without-contracts)).
- Lifecycle parameters: in database lifecycle hooks, the values of `event.params.data` and `event.params.where` are `unknown`. Narrow them at runtime.
- Query Engine: `strapi.db.query()` results stay `any`.
- Read-only arrays: a `fields` or `populate` array declared `as const` is rejected, with strict types on and off. Pass a mutable copy, for instance `populate: [...populate]`.

<br />

:::strapi What to do next?
- Turn strict types on in an existing project with the [dedicated guide](/cms/typescript/enabling-strict-types).
- Review the [TypeScript configuration](/cms/configurations/typescript) options.
- Learn more about [TypeScript development](/cms/typescript/development) with Strapi.
:::
