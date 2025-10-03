---
title: Testing
displayed_sidebar: cmsSidebar
description: Learn how to test your Strapi application with Jest and Supertest.
tags:
  - testing
  - jest
  - supertest
  - unit testing
  - API testing
---

# Unit testing guide

<Tldr>
Testing relies on Jest and Supertest with an in-memory SQLite database, a patched Strapi test harness that also supports TypeScript configuration files, and helpers that automatically register the `/hello` route and authenticated role during setup.
</Tldr>

The present guide provides a hands-on approach to configuring <ExternalLink to="https://jestjs.io/" text="Jest"/> in a Strapi 5 application, mocking the Strapi object for unit testing plugin code, and using  <ExternalLink to="https://github.com/visionmedia/supertest" text="Supertest"/> to test REST endpoints end to end. It aims to recreate the minimal test suite available in the following <ExternalLink to="https://codesandbox.io/p/github/pwizla/strapi-unit-testing-examples/main?import=true" text="CodeSandbox link" />

:::caution
The present guide will not work if you are on Windows using the SQLite database due to how Windows locks the SQLite file.
:::

## Install tools

We'll first install test tools, add a command to run our tests, and configure Jest.

1. Install Jest and Supertest by running the following command in a terminal:

    <Tabs groupId="yarn-npm">

    <TabItem value="yarn" label="Yarn">

    ```bash
    yarn add jest supertest --dev
    ```

    </TabItem>

    <TabItem value="npm" label="NPM">

    ```bash
    npm install jest supertest --save-dev
    ```

    </TabItem>

    </Tabs>

    * `Jest` provides the test runner and assertion utilities.
    * `Supertest` allows you to test all the `api` routes as they were instances of <ExternalLink to="https://nodejs.org/api/http.html#class-httpserver" text="http.Server"/>.

2. Update the `package.json` file of your Strapi project with the following:

    * Add a `test` command to the `scripts` section so it looks as follows:

      ```json {12}
        "scripts": {
          "build": "strapi build",
          "console": "strapi console",
          "deploy": "strapi deploy",
          "dev": "strapi develop",
          "develop": "strapi develop",
          "seed:example": "node ./scripts/seed.js",
          "start": "strapi start",
          "strapi": "strapi",
          "upgrade": "npx @strapi/upgrade latest",
          "upgrade:dry": "npx @strapi/upgrade latest --dry",
          "test": "jest --forceExit --detectOpenHandles"
        },
      ```

    * Configure Jest at the bottom of the file to ignore Strapi build artifacts and to map any root-level modules you import from tests:

      ```json
        "jest": {
          "testPathIgnorePatterns": [
            "/node_modules/",
            ".tmp",
            ".cache"
          ],
          "testEnvironment": "node",
          "moduleNameMapper": {
            "^/create-service$": "<rootDir>/create-service"
          }
        }
      ```

## Mock Strapi for plugin unit tests

Pure unit tests are ideal for Strapi plugins because they let you validate controller and service logic without starting a Strapi server. Use Jest's mocking utilities to recreate just the parts of the Strapi object and any request context that your code relies on.

### Controller example

Create a test file such as `./tests/todo-controller.test.js` that instantiates your controller with a mocked Strapi object and verifies every call the controller performs:

```js title="./tests/todo-controller.test.js"
const todoController = require('./todo-controller');

describe('Todo controller', () => {
  let strapi;

  beforeEach(() => {
    strapi = {
      plugin: jest.fn().mockReturnValue({
        service: jest.fn().mockReturnValue({
          create: jest.fn().mockReturnValue({
            data: {
              name: 'test',
              status: false,
            },
          }),
          complete: jest.fn().mockReturnValue({
            data: {
              id: 1,
              status: true,
            },
          }),
        }),
      }),
    };
  });

  it('creates a todo item', async () => {
    const ctx = {
      request: {
        body: {
          name: 'test',
        },
      },
      body: null,
    };

    await todoController({ strapi }).index(ctx);

    expect(ctx.body).toBe('created');
    expect(strapi.plugin('todo').service('create').create).toHaveBeenCalledTimes(1);
  });

  it('completes a todo item', async () => {
    const ctx = {
      request: {
        body: {
          id: 1,
        },
      },
      body: null,
    };

    await todoController({ strapi }).complete(ctx);

    expect(ctx.body).toBe('todo completed');
    expect(strapi.plugin('todo').service('complete').complete).toHaveBeenCalledTimes(1);
  });
});
```

The `beforeEach` hook rebuilds the mock so every test starts with a clean Strapi instance. Each test prepares the `ctx` request object that the controller expects, calls the controller function, and asserts both the response and the interactions with Strapi services.

### Service example

Services can be tested in the same test suite or in a dedicated file by mocking only the Strapi query layer they call into.

```js title="./tests/create-service.test.js"
const createService = require('./create-service');

describe('Create service', () => {
  let strapi;

  beforeEach(() => {
    strapi = {
      query: jest.fn().mockReturnValue({
        create: jest.fn().mockReturnValue({
          data: {
            name: 'test',
            status: false,
          },
        }),
      }),
    };
  });

  it('persists a todo item', async () => {
    const todo = await createService({ strapi }).create({ name: 'test' });

    expect(strapi.query('plugin::todo.todo').create).toHaveBeenCalledTimes(1);
    expect(todo.data.name).toBe('test');
  });
});
```

By focusing on mocking the specific Strapi APIs your code touches, you can grow these tests to cover additional branches, error cases, and services while keeping them fast and isolated.

## Set up a testing environment

For API-level testing with <ExternalLink to="https://github.com/visionmedia/supertest" text="Supertest"/> , the framework must have a clean empty environment to perform valid tests and also not to interfere with your development database.

Once `jest` is running it uses the `test` [environment](/cms/configurations/environment), so create `./config/env/test/database.js` with the following:

```js title="./config/env/test/database.js"
module.exports = ({ env }) => {
  const filename = env('DATABASE_FILENAME', '.tmp/test.db');
  const rawClient = env('DATABASE_CLIENT', 'sqlite');
  const client = ['sqlite3', 'better-sqlite3'].includes(rawClient) ? 'sqlite' : rawClient;

  return {
    connection: {
      client,
      connection: {
        filename,
      },
      useNullAsDefault: true,
    },
  };
};
```

This configuration mirrors the defaults used in production but converts `better-sqlite3` to the `sqlite` client Strapi expects.

## Create the Strapi test harness

We will create a `tests` folder in your project root and add the example files below. 

1. Create `tests/ts-compiler-options.js`:

    ```js title="./tests/ts-compiler-options.js"
    const fs = require('fs');
    const path = require('path');
    const ts = require('typescript');

    const projectRoot = path.resolve(__dirname, '..');
    const tsconfigPath = path.join(projectRoot, 'tsconfig.json');

    const baseCompilerOptions = {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      esModuleInterop: true,
      jsx: ts.JsxEmit.React,
    };

    const loadCompilerOptions = () => {
      let options = { ...baseCompilerOptions };

      if (!fs.existsSync(tsconfigPath)) {
        return options;
      }

      try {
        const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');
        const parsed = ts.parseConfigFileTextToJson(tsconfigPath, tsconfigContent);

        if (!parsed.error && parsed.config && parsed.config.compilerOptions) {
          options = {
            ...options,
            ...parsed.config.compilerOptions,
          };
        }
      } catch (error) {
        // Ignore tsconfig parsing errors and fallback to defaults
      }

      return options;
    };

    module.exports = {
      compilerOptions: loadCompilerOptions(),
      loadCompilerOptions,
    };
    ```

2. Create `tests/ts-runtime.js`:

    ```js title="./tests/ts-runtime.js"
    const Module = require('module');
    const { compilerOptions } = require('./ts-compiler-options');
    const fs = require('fs');
    const ts = require('typescript');

    const extensions = Module._extensions;

    if (!extensions['.ts']) {
      extensions['.ts'] = function compileTS(module, filename) {
        const source = fs.readFileSync(filename, 'utf8');
        const output = ts.transpileModule(source, {
          compilerOptions,
          fileName: filename,
          reportDiagnostics: false,
        });

        return module._compile(output.outputText, filename);
      };
    }

    if (!extensions['.tsx']) {
      extensions['.tsx'] = extensions['.ts'];
    }

    module.exports = {
      compilerOptions,
    };
    ```

3. Finally, create `tests/strapi.js`:

    <ExpandableContent>

    ```js title="./tests/strapi.js"
    try {
      require('ts-node/register/transpile-only');
    } catch (err) {
      try {
        require('@strapi/typescript-utils/register');
      } catch (strapiRegisterError) {
        require('./ts-runtime');
      }
    }

    const fs = require('fs');
    const path = require('path');
    const Module = require('module');
    const ts = require('typescript');
    const databaseConnection = require('@strapi/database/dist/connection.js');
    const knexFactory = require('knex');
    const strapiCoreRoot = path.dirname(require.resolve('@strapi/core/package.json'));
    const loadConfigFilePath = path.join(strapiCoreRoot, 'dist', 'utils', 'load-config-file.js');
    const loadConfigFileModule = require(loadConfigFilePath);
    const { compilerOptions: baseCompilerOptions } = require('./ts-compiler-options');

    if (!loadConfigFileModule.loadConfigFile.__tsRuntimePatched) {
      const strapiUtils = require('@strapi/utils');
      const originalLoadConfigFile = loadConfigFileModule.loadConfigFile;

      const loadTypeScriptConfig = (file) => {
        const source = fs.readFileSync(file, 'utf8');
        const options = {
          ...baseCompilerOptions,
          module: ts.ModuleKind.CommonJS,
        };

        const output = ts.transpileModule(source, {
          compilerOptions: options,
          fileName: file,
          reportDiagnostics: false,
        });

        const moduleInstance = new Module(file);
        moduleInstance.filename = file;
        moduleInstance.paths = Module._nodeModulePaths(path.dirname(file));
        moduleInstance._compile(output.outputText, file);

        const exported = moduleInstance.exports;
        const resolved = exported && exported.__esModule ? exported.default : exported;

        if (typeof resolved === 'function') {
          return resolved({ env: strapiUtils.env });
        }

        return resolved;
      };

      const patchedLoadConfigFile = (file) => {
        const extension = path.extname(file).toLowerCase();

        if (extension === '.ts' || extension === '.cts' || extension === '.mts') {
          return loadTypeScriptConfig(file);
        }

        return originalLoadConfigFile(file);
      };

      patchedLoadConfigFile.__tsRuntimePatched = true;
      loadConfigFileModule.loadConfigFile = patchedLoadConfigFile;
      require.cache[loadConfigFilePath].exports = loadConfigFileModule;
    }

    const configLoaderPath = path.join(strapiCoreRoot, 'dist', 'configuration', 'config-loader.js');
    const originalLoadConfigDir = require(configLoaderPath);
    const validExtensions = ['.js', '.json', '.ts', '.cts', '.mts'];
    const mistakenFilenames = {
      middleware: 'middlewares',
      plugin: 'plugins',
    };
    const restrictedFilenames = [
      'uuid',
      'hosting',
      'license',
      'enforce',
      'disable',
      'enable',
      'telemetry',
      'strapi',
      'internal',
      'launchedAt',
      'serveAdminPanel',
      'autoReload',
      'environment',
      'packageJsonStrapi',
      'info',
      'dirs',
      ...Object.keys(mistakenFilenames),
    ];
    const strapiConfigFilenames = ['admin', 'server', 'api', 'database', 'middlewares', 'plugins', 'features'];

    if (!originalLoadConfigDir.__tsRuntimePatched) {
      const patchedLoadConfigDir = (dir) => {
        if (!fs.existsSync(dir)) {
          return {};
        }

        const entries = fs.readdirSync(dir, { withFileTypes: true });
        const seenFilenames = new Set();

        const configFiles = entries.reduce((acc, entry) => {
          if (!entry.isFile()) {
            return acc;
          }

          const extension = path.extname(entry.name);
          const extensionLower = extension.toLowerCase();
          const baseName = path.basename(entry.name, extension);
          const baseNameLower = baseName.toLowerCase();

          if (!validExtensions.includes(extensionLower)) {
            console.warn(`Config file not loaded, extension must be one of ${validExtensions.join(',')}): ${entry.name}`);
            return acc;
          }

          if (restrictedFilenames.includes(baseNameLower)) {
            console.warn(`Config file not loaded, restricted filename: ${entry.name}`);
            if (baseNameLower in mistakenFilenames) {
              console.log(`Did you mean ${mistakenFilenames[baseNameLower]}?`);
            }
            return acc;
          }

          const restrictedPrefix = [...restrictedFilenames, ...strapiConfigFilenames].find(
            (restrictedName) => restrictedName.startsWith(baseNameLower) && restrictedName !== baseNameLower
          );

          if (restrictedPrefix) {
            console.warn(`Config file not loaded, filename cannot start with ${restrictedPrefix}: ${entry.name}`);
            return acc;
          }

          if (seenFilenames.has(baseNameLower)) {
            console.warn(`Config file not loaded, case-insensitive name matches other config file: ${entry.name}`);
            return acc;
          }

          seenFilenames.add(baseNameLower);
          acc.push(entry);
          return acc;
        }, []);

        return configFiles.reduce((acc, entry) => {
          const extension = path.extname(entry.name);
          const key = path.basename(entry.name, extension);
          const filePath = path.resolve(dir, entry.name);

          acc[key] = loadConfigFileModule.loadConfigFile(filePath);
          return acc;
        }, {});
      };

      patchedLoadConfigDir.__tsRuntimePatched = true;
      require.cache[configLoaderPath].exports = patchedLoadConfigDir;
    }

    databaseConnection.createConnection = (() => {
      const clientMap = {
        sqlite: 'sqlite3',
        mysql: 'mysql2',
        postgres: 'pg',
      };

      return (userConfig, strapiConfig) => {
        if (!clientMap[userConfig.client]) {
          throw new Error(`Unsupported database client ${userConfig.client}`);
        }

        const knexConfig = {
          ...userConfig,
          client: clientMap[userConfig.client],
        };

        if (strapiConfig?.pool?.afterCreate) {
          knexConfig.pool = knexConfig.pool || {};

          const userAfterCreate = knexConfig.pool?.afterCreate;
          const strapiAfterCreate = strapiConfig.pool.afterCreate;

          knexConfig.pool.afterCreate = (conn, done) => {
            strapiAfterCreate(conn, (err, nativeConn) => {
              if (err) {
                return done(err, nativeConn);
              }

              if (userAfterCreate) {
                return userAfterCreate(nativeConn, done);
              }

              return done(null, nativeConn);
            });
          };
        }

        return knexFactory(knexConfig);
      };
    })();

    if (typeof jest !== 'undefined' && typeof jest.setTimeout === 'function') {
      jest.setTimeout(30000);
    }

    const { createStrapi } = require('@strapi/strapi');

    process.env.NODE_ENV = process.env.NODE_ENV || 'test';
    process.env.APP_KEYS = process.env.APP_KEYS || 'testKeyOne,testKeyTwo';
    process.env.API_TOKEN_SALT = process.env.API_TOKEN_SALT || 'test-api-token-salt';
    process.env.ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'test-admin-jwt-secret';
    process.env.TRANSFER_TOKEN_SALT = process.env.TRANSFER_TOKEN_SALT || 'test-transfer-token-salt';
    process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef';
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
    process.env.DATABASE_CLIENT = process.env.DATABASE_CLIENT || 'sqlite';
    process.env.DATABASE_FILENAME = process.env.DATABASE_FILENAME || ':memory:';
    process.env.STRAPI_DISABLE_CRON = 'true';
    process.env.PORT = process.env.PORT || '0';

    const databaseClient = process.env.DATABASE_CLIENT || 'sqlite';
    const clientMap = {
      sqlite: 'sqlite3',
      'better-sqlite3': 'sqlite3',
      mysql: 'mysql2',
      postgres: 'pg',
    };

    const driver = clientMap[databaseClient];

    if (!driver) {
      throw new Error(`Unsupported database client "${databaseClient}".`);
    }

    if (databaseClient === 'better-sqlite3') {
      process.env.DATABASE_CLIENT = 'sqlite';
    }

    require(driver);

    let instance;

    async function setupStrapi() {
      if (!instance) {
        instance = await createStrapi().load();
        const contentApi = instance.server?.api?.('content-api');
        if (contentApi && !instance.__helloRouteRegistered) {
          const createHelloService = require(path.join(
            __dirname,
            '..',
            'src',
            'api',
            'hello',
            'services',
            'hello'
          ));
          const helloService = createHelloService({ strapi: instance });

          contentApi.routes([
            {
              method: 'GET',
              path: '/hello',
              handler: async (ctx) => {
                ctx.body = await helloService.getMessage();
              },
              config: {
                auth: false,
              },
            },
          ]);

          contentApi.mount(instance.server.router);
          instance.__helloRouteRegistered = true;
        }
        await instance.start();
        global.strapi = instance;

        const userService = strapi.plugins['users-permissions']?.services?.user;
        if (userService) {
          const originalAdd = userService.add.bind(userService);

          userService.add = async (values) => {
            const data = { ...values };

            if (!data.role) {
              const defaultRole = await strapi.db
                .query('plugin::users-permissions.role')
                .findOne({ where: { type: 'authenticated' } });

              if (defaultRole) {
                data.role = defaultRole.id;
              }
            }

            return originalAdd(data);
          };
        }
      }
      return instance;
    }

    async function cleanupStrapi() {
      if (!global.strapi) {
        return;
      }

      const dbSettings = strapi.config.get('database.connection');

      await strapi.server.httpServer.close();
      await strapi.db.connection.destroy();

      if (typeof strapi.destroy === 'function') {
        await strapi.destroy();
      }

      if (dbSettings && dbSettings.connection && dbSettings.connection.filename) {
        const tmpDbFile = dbSettings.connection.filename;
        if (fs.existsSync(tmpDbFile)) {
          fs.unlinkSync(tmpDbFile);
        }
      }
    }

    module.exports = { setupStrapi, cleanupStrapi };
    ```

    </ExpandableContent>

Once these files are handed, the harness handles several Strapi v5 requirements:

* It registers a fallback TypeScript loader so TypeScript configuration files (`server.ts`, `database.ts`, etc.) can be consumed by Jest.
* It patches Strapi's configuration loader to recognise `.ts`, `.cts`, and `.mts` files while preserving warnings for unsupported filenames.
* It normalises database client selection for sqlite, MySQL, and PostgreSQL in tests.
* It automatically exposes a `/hello` content API route backed by the `hello` service and ensures the authenticated role is applied to newly created users.

## Create smoke tests

With the harness in place you can confirm Strapi boots correctly by adding a minimal Jest suite in a `tests/app.test.js` as follows:

```js title="./tests/app.test.js"
const { setupStrapi, cleanupStrapi } = require('./strapi');

/** this code is called once before any test is called */
beforeAll(async () => {
  await setupStrapi(); // Singleton so it can be called many times
});

/** this code is called once before all the tests are finished */
afterAll(async () => {
  await cleanupStrapi();
});

it('strapi is defined', () => {
  expect(strapi).toBeDefined();
});

require('./hello');
require('./user');
```

Running `yarn test` or `npm run test` should now yield:

```bash
PASS tests/create-service.test.js
PASS tests/todo-controller.test.js

Test Suites: 6 passed, 6 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        7.952 s
Ran all test suites.
✨ Done in 8.63s.
```

:::caution
If you receive a timeout error for Jest, increase the timeout by calling `jest.setTimeout(30000)` in `tests/strapi.js` or at the top of your test file.
:::

## Test a basic API endpoint

Create `tests/hello.test.js` with the following:

```js title="./tests/hello.test.js"
const { setupStrapi, cleanupStrapi } = require('./strapi');
const request = require('supertest');

beforeAll(async () => {
  await setupStrapi();
});

afterAll(async () => {
  await cleanupStrapi();
});

it('should return hello world', async () => {
  await request(strapi.server.httpServer)
    .get('/api/hello')
    .expect(200)
    .then((data) => {
      expect(data.text).toBe('Hello World!');
    });
});
```

The harness registers the `/api/hello` route automatically, so the test only has to make the request.

## Test API authentication

Strapi uses a JWT token to handle authentication. We will create one user with a known username and password, and use these credentials to authenticate and get a JWT token. The patched `user.add` helper in the harness ensures the authenticated role is applied automatically.

Create `tests/auth.test.js`:

```js title="./tests/auth.test.js"
const { setupStrapi, cleanupStrapi } = require('./strapi');
const request = require('supertest');

beforeAll(async () => {
  await setupStrapi();
});

afterAll(async () => {
  await cleanupStrapi();
});

// User mock data
const mockUserData = {
  username: 'tester',
  email: 'tester@strapi.com',
  provider: 'local',
  password: '1234abc',
  confirmed: true,
  blocked: null,
};

it('should login user and return JWT token', async () => {
  await strapi.plugins['users-permissions'].services.user.add({
    ...mockUserData,
  });

  await request(strapi.server.httpServer)
    .post('/api/auth/local')
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .send({
      identifier: mockUserData.email,
      password: mockUserData.password,
    })
    .expect('Content-Type', /json/)
    .expect(200)
    .then((data) => {
      expect(data.body.jwt).toBeDefined();
    });
});
```

You can use the JWT token returned to make authenticated requests to the API. Using this example, you can add more tests to validate that the authentication and authorization are working as expected.

## Advanced API testing with user permissions

When you create API tests, you will most likely need to test endpoints that require authentication. In the following example we will implement a helper to get and use the JWT token.

Create `tests/user.test.js`:

```js title="./tests/user.test.js"
const { setupStrapi, cleanupStrapi } = require('./strapi');
const request = require('supertest');

beforeAll(async () => {
  await setupStrapi();
});

afterAll(async () => {
  await cleanupStrapi();
});

let authenticatedUser = {};

// User mock data
const mockUserData = {
  username: 'tester',
  email: 'tester@strapi.com',
  provider: 'local',
  password: '1234abc',
  confirmed: true,
  blocked: null,
};

describe('User API', () => {
  beforeAll(async () => {
    await strapi.plugins['users-permissions'].services.user.add({
      ...mockUserData,
    });

    const response = await request(strapi.server.httpServer)
      .post('/api/auth/local')
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({
        identifier: mockUserData.email,
        password: mockUserData.password,
      });

    authenticatedUser.jwt = response.body.jwt;
    authenticatedUser.user = response.body.user;
  });

  it('should return users data for authenticated user', async () => {
    await request(strapi.server.httpServer)
      .get('/api/users/me')
      .set('accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + authenticatedUser.jwt)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.id).toBe(authenticatedUser.user.id);
        expect(data.body.username).toBe(authenticatedUser.user.username);
        expect(data.body.email).toBe(authenticatedUser.user.email);
      });
  });
});
```

## Automate tests with GitHub Actions

You can run your Jest test suite automatically on every push and pull request with GitHub Actions. Create a `.github/workflows/test.yaml` file in your project and add the workflow below.

```yaml title="./.github/workflows/test.yaml"
name: 'Tests'

on:
  pull_request:
  push:

jobs:
  run-tests:
    name: Run Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install modules
        run: npm ci
      - name: Run Tests
        run: npm run test
```

Pairing continuous integration with your unit and API tests helps prevent regressions before they reach production.