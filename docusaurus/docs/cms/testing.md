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
Testing uses Jest and Supertest with a temporary SQLite database to run unit and API checks. Walkthroughs generate a Strapi instance, verify endpoints like `/hello`, and authenticate users to ensure controllers behave as expected.
</Tldr>

The present guide shows how to configure Jest in a Strapi application, mock the Strapi object to unit test plugin code, and use Supertest to exercise REST endpoints end-to-end by presenting the essential steps so you can cover your plugin business logic and HTTP API endpoints from a single test setup.

With this guide you will use <ExternalLink to="https://jestjs.io/" text="Jest"/> as the testing framework for both unit and API tests and <ExternalLink to="https://github.com/visionmedia/supertest" text="Supertest"/> as the super-agent driven library for testing Node.js HTTP servers with a fluent API.

:::strapi Related resources
Strapi's blog covered <ExternalLink to="https://strapi.io/blog/how-to-add-unit-tests-to-your-strapi-plugin" text="adding unit tests to a Strapi plugin"/> and <ExternalLink to="https://strapi.io/blog/automated-testing-for-strapi-api-with-jest-and-supertest" text="testing a Strapi API with Jest and Supertest"/> with Strapi v4.
:::

:::caution
The present guide will not work if you are on Windows using the SQLite database due to how Windows locks the SQLite file.
:::

## Install test tools

* `Jest` contains a set of guidelines or rules used for creating and designing test cases, a combination of practices and tools that are designed to help testers test more efficiently.
* `Supertest` allows you to test all the `api` routes as they were instances of <ExternalLink to="https://nodejs.org/api/http.md#http_class_http_server" text="http.Server"/>. Pair it with Jest for HTTP assertions.
* `sqlite3` is used to create an on-disk database that is created and deleted between tests so your API tests run against isolated data.

1. Install all tools required throughout this guide by running the following command in a terminal:

    <Tabs groupId="yarn-npm">

    <TabItem value="yarn" label="Yarn">

    ```bash
    yarn add jest supertest sqlite3 --dev
    ```

    </TabItem>

    <TabItem value="npm" label="NPM">

    ```bash
    npm install jest supertest sqlite3 --save-dev
    ```

    </TabItem>

    </Tabs>

2. Add the following to the `package.json` file of your Strapi project:

   * add `test` command to `scripts` section:

      ```json
        "scripts": {
          "develop": "strapi develop",
          "start": "strapi start",
          "build": "strapi build",
          "strapi": "strapi",
          "test": "jest --forceExit --detectOpenHandles"
        },
      ```

   * and add the following lines at the bottom of the file, to inform `Jest` not to look for tests inside folders where it shouldn't:

      ```json
        "jest": {
          "testPathIgnorePatterns": [
            "/node_modules/",
            ".tmp",
            ".cache"
          ],
          "testEnvironment": "node"
        }
      ```

## Mock Strapi for plugin unit tests

Pure unit tests are ideal for Strapi plugins because they let you validate controller and service logic without starting a Strapi server. Use Jest's mocking utilities to recreate just the parts of the Strapi object and any request context that your code relies on.

### Controller example

Create a test file such as `./tests/todo-controller.test.js` that instantiates your controller with a mocked Strapi object and verifies every call the controller performs:

```js title="./tests/todo-controller.test.js"
const todoController = require('../server/controllers/todo-controller');

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
const createService = require('../server/services/create');

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

For API-level testing with Supertest, the framework must have a clean empty environment to perform valid tests and also not to interfere with your development database.

Once `jest` is running it uses the `test` [environment](/cms/configurations/environment) (switching `NODE_ENV` to `test`)
so we need to create a special environment setting for this purpose.

Create `./config/env/test/database.js` and add the following:

```js title="./config/env/test/database.js"
module.exports = ({ env }) => ({
  connection: {
    client: 'sqlite',
    connection: {
      filename: env('DATABASE_FILENAME', '.tmp/test.db'),
    },
    useNullAsDefault: true,
  },
});
```

## Create the Strapi test instance

1. Create a `tests` folder in your project root.
2. Create a `tests/strapi.js` file with the following code:

    ```js title="./tests/strapi.js"
    const Strapi = require('@strapi/strapi');
    const fs = require('fs');

    let instance;

    async function setupStrapi() {
      if (!instance) {
        await Strapi().load();
        instance = strapi;

        await instance.server.mount();
      }
      return instance;
    }

    async function cleanupStrapi() {
      const dbSettings = strapi.config.get('database.connection');

      // Close server to release the db-file
      await strapi.server.httpServer.close();

      // Close the connection to the database before deletion
      await strapi.db.connection.destroy();

      // Delete test database after all tests have completed
      if (dbSettings && dbSettings.connection && dbSettings.connection.filename) {
        const tmpDbFile = dbSettings.connection.filename;
        if (fs.existsSync(tmpDbFile)) {
          fs.unlinkSync(tmpDbFile);
        }
      }
    }

    module.exports = { setupStrapi, cleanupStrapi };
    ```

3. Create `tests/app.test.js` with the following basic Strapi test:

    ```js title="./tests/app.test.js"
    const { setupStrapi, cleanupStrapi } = require('./strapi');

    beforeAll(async () => {
      await setupStrapi();
    });

    afterAll(async () => {
      await cleanupStrapi();
    });

    it('strapi is defined', () => {
      expect(strapi).toBeDefined();
    });
    ```

This should be all you need for writing unit tests that rely on a booted Strapi instance. Run `yarn test` or `npm run test` and see the result of your first test, as in the following example:

```bash
yarn run v1.13.0
$ jest
 PASS  tests/app.test.js
  ✓ strapi is defined (2 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        4.187 s, estimated 6 s
Ran all test suites.
✨  Done in 6.61s.
```

:::caution
If you receive a timeout error for Jest, please add the following line right before the `beforeAll` method in the `app.test.js` file: `jest.setTimeout(15000)` and adjust the milliseconds value as you need.
:::

## Test a basic API endpoint

:::tip
In this example we'll reuse the `Hello world` `/hello` endpoint from the [controllers](/cms/backend-customization/controllers) section.
<!-- the link below is reported to have a missing hash by the check-links plugin, but everything is fine 🤷 -->
:::

Create `tests/hello.test.js` with the following:

```js title="./tests/hello.test.js"
const fs = require('fs');
const { setupStrapi, cleanupStrapi } = require('./strapi');
const request = require('supertest');

beforeAll(async () => {
  await setupStrapi();
});

afterAll(async () => {
  await cleanupStrapi();
});

it('should return hello world', async () => {
  // Get the Koa server from strapi instance
  await request(strapi.server.httpServer)
    .get('/api/hello') // Make a GET request to the API
    .expect(200) // Expect response http code 200
    .then((data) => {
      expect(data.text).toBe('Hello World!'); // Expect response content
    });
});
```

Then run the test with `npm test` or `yarn test` command.

## Test API authentication

Strapi uses a JWT token to handle authentication. We will create one user with a known username and password, and use these credentials to authenticate and get a JWT token.

Let's create a new test file `tests/auth.test.js`:

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
  // Creates a new user and saves it to the database
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

1. Create `tests/user.test.js`:

    ```js title="./tests/user.test.js"
    const fs = require('fs');
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
      // Create and authenticate a user before all tests
      beforeAll(async () => {
        // Create user and get JWT token
        const user = await strapi.plugins['users-permissions'].services.user.add({
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

2. Run all tests by adding the following to `tests/app.test.js`:

    ```js title="./tests/app.test.js"
    const { setupStrapi, cleanupStrapi } = require('./strapi');

    /** this code is called once before any test is called */
    beforeAll(async () => {
      await setupStrapi(); // Singleton so it can be called many times
    });

    /** this code is called once before all the tested are finished */
    afterAll(async () => {
      await cleanupStrapi();
    });

    it('strapi is defined', () => {
      expect(strapi).toBeDefined();
    });

    require('./hello');
    require('./user');
    ```

All the tests above should return a console output like in the following example:

```bash
➜  my-project git:(master) yarn test
yarn run v1.13.0
$ jest
 PASS  tests/app.test.js
  ✓ strapi is defined (4 ms)
  ✓ should return hello world (15 ms)
  User API
    ✓ should return users data for authenticated user (18 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        6.874 s, estimated 9 s
Ran all test suites.
✨  Done in 8.40s.
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