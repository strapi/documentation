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

Pure unit tests are ideal for Strapi plugins because they let you validate controller and service logic without starting a Strapi server. Use Jest's **mocking** <Annotation>Mocking is a testing technique where you create fake versions of parts of your application (like services or database calls) to test code in isolation. Instead of connecting to a real database or calling actual services, the mock returns predefined responses, making tests faster and more predictable.</Annotation> utilities to recreate just the parts of the Strapi object and any request context that your code relies on.

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

We will create a `tests` folder in your project root and add the example files below. These 3 files work together to create a complete testing infrastructure:

* `ts-compiler-options.js` defines how TypeScript files should be compiled for testing
* `ts-runtime.js` enables Jest to understand and execute TypeScript files on the fly
* `strapi.js` is the main **test harness** <Annotation>A test harness is a collection of software and test data configured to test an application by running it in predefined conditions and monitoring its behavior.<br/><br/>In the present case, our test harness sets up a complete Strapi instance in an isolated testing environment, handles TypeScript files, and provides utilities to make testing easier.</Annotation> that sets up and tears down Strapi instances for tests

### TypeScript compiler configuration

Create `tests/ts-compiler-options.js` with the following content:

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

This file loads your project's TypeScript configuration and provides sensible defaults if the config file doesn't exist.

### TypeScript runtime loader

Create `tests/ts-runtime.js` with the following content:

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

This file teaches Node.js how to load `.ts` and `.tsx` files by transpiling them to JavaScript on the fly.

### Main test harness

Create `tests/strapi.js` with the following content:

<ExpandableContent title="View the complete test harness code">

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

// ============================================
// 1. PATCH: TypeScript Configuration Loader
// ============================================
// This section patches Strapi's configuration loader to support TypeScript config files
// (.ts, .cts, .mts). Without this, Strapi would only load .js and .json config files.

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

// ============================================
// 2. PATCH: Configuration Directory Scanner
// ============================================
// This section patches how Strapi scans the config directory to:
// - Support TypeScript extensions (.ts, .cts, .mts)
// - Validate config file names
// - Prevent loading of restricted filenames

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

// ============================================
// 3. PATCH: Database Connection Handler
// ============================================
// This section normalizes database client names for testing.
// Maps Strapi's client names (sqlite, mysql, postgres) to actual driver names
// (sqlite3, mysql2, pg) and handles connection pooling.

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

// ============================================
// 4. TEST ENVIRONMENT SETUP
// ============================================
// Configure Jest timeout and set required environment variables for testing

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

// ============================================
// 5. STRAPI INSTANCE MANAGEMENT
// ============================================
// Functions to set up and tear down a Strapi instance for testing

async function setupStrapi() {
  if (!instance) {
    instance = await createStrapi().load();
    
    // Register the /api/hello test route automatically
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

    // Patch the user service to automatically assign the authenticated role
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

What the test harness does:

1. **TypeScript Support**: Patches Strapi's configuration loader to understand TypeScript files (`.ts`, `.cts`, `.mts`) in your config directory
2. **Configuration Validation**: Ensures only valid config files are loaded and warns about common mistakes (like naming a file `middleware.js` instead of `middlewares.js`)
3. **Database Normalization**: Maps database client names to their actual driver names (e.g., `sqlite` → `sqlite3`) and handles connection pooling
4. **Environment Setup**: Sets all required environment variables for testing, including JWT secrets and database configuration
5. **Automatic Route Registration**: Automatically registers a `/api/hello` test endpoint that you can use in your tests
6. **User Permission Helper**: Patches the user service to automatically assign the "authenticated" role to newly created users, simplifying authentication tests
7. **Cleanup**: Properly closes connections and removes temporary database files after tests complete

Once these files are in place, the harness handles several Strapi 5 requirements automatically, letting you focus on writing actual test logic rather than configuration boilerplate.

## Create smoke tests

With the harness in place you can confirm Strapi boots correctly by adding a minimal Jest suite with the following **smoke tests** <Annotation>Smoke tests are basic tests that verify the most critical functionality works. The term comes from hardware testing: if you turn on a device and it doesn't catch fire (produce smoke), it passes the first test. In software, smoke tests check if the application starts correctly and basic features work before running more detailed tests.</Annotation> in a `tests/app.test.js` as follows:

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

To go further, you can run your Jest test suite automatically on every push and pull request with <ExternalLink to="https://github.com/features/actions" text="GitHub Actions" />. Create a `.github/workflows/test.yaml` file in your project and add the workflow as follows:

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