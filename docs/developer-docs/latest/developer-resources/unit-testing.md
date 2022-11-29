---
title: Unit and Route Testing - Strapi Developer Docs
description: Learn in this guide how you can run basic unit tests for a Strapi application using a testing framework.
sidebarDepth: 2
canonicalUrl: https://docs.strapi.io/developer-docs/latest/guides/unit-testing.html
---

# Unit and Route Testing

Testing code units and API routes in a Strapi application can be done with [Jest](https://jestjs.io/) and [Supertest](https://github.com/visionmedia/supertest), with an SQLite database. This documentation describes implementing:

- a unit test for a function,
- a public API endpoint test,
- and an API endpoint test with authorization.

Refer to the testing framework documentation for other use cases and for the full set of testing options and configurations.

:::caution
The tests described below are incompatible with Windows using the SQLite database due to how Windows locks the SQLite file.
:::

## Install and configure the test tools

`Jest` contains a set of guidelines or rules used for creating and designing test cases - a combination of practices and tools that are designed to help testers test more efficiently.

`Supertest` allows you to test the API routes as if they were instances of [http.Server](https://nodejs.org/api/http.md#http_class_http_server)

`better-sqlite3` is used to create an on-disk database that is created and deleted between tests.
<!-- TODO rewrite this intro section-->

### Install for JavaScript applications

1. Add the tools to the dev dependencies:

<code-group>
<code-block title=YARN>

```sh
yarn add jest --dev
yarn add supertest --dev 
yarn add better-sqlite3 --dev 
  ```

  </code-block>

<code-block title=NPM>

```sh
npm install jest --save-dev
npm install supertest --save-dev
npm install better-sqlite3 --save-dev #not required if better-sqlite3 is in your dependencies
```

</code-block>
</code-group>

2. Add `test` to the `package.json` file `scripts` section:

``` json{6}
  "scripts": {
    "develop": "strapi develop",
    "start": "strapi start",
    "build": "strapi build",
    "strapi": "strapi",
    "test": "jest --forceExit --detectOpenHandles --watchAll"
  },
```

3. Add a `jest` section to the `package.json` file with the following code:

```json
//path: ./package.json
//...
  "jest": {
    "testPathIgnorePatterns": [
      "/node_modules/",
      ".tmp",
      ".cache"
    ],
    "testEnvironment": "node"
  }
  //...
```
4. Save and close your `package.json` file.

## Create a testing environment

The testing environment should test the application code without affecting the database, and should be able to run distinct units of the application to incrementally test the code functionality. To achieve this the following instructions add:

- a test database,
- a `strapi` instance for testing,
- and file directories to organize the testing environment.

### Create a test environment database configuration file

The test framework must have a clean and empty environment to perform valid tests and to not interfere with the development database. Once `jest` is running it uses the `test` [environment](/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.md) by switching `NODE_ENV` to `test`.

1. Create the subdirectories `env/test/` in the `./config/` directory.
2. Create a new database configuration file `database.js` for the test env in `./config/env/test/`.
3. Add the following code to `./config/env/test/database.js`:

```js
// path: ./config/env/test/database.js

const path = require('path');

module.exports = ({ env }) => ({
  connection: {
    client: 'sqlite',
    connection: {
      filename: path.join(__dirname, '..', env('DATABASE_FILENAME', '.tmp/data.db')),
    },
    useNullAsDefault: true,
  },
});
```

### Create a `strapi` instance

The testing environment requires a `strapi` instance as an object, similar to creating an instance for the [process manager](/developer-docs/latest/setup-deployment-guides/deployment/optional-software/process-manager.md).

1. Create a `tests` directory at the application root, which hosts all of the tests.
2. Create a `helpers` directory inside `tests`, which hosts the `strapi` instance and other supporting functions.
3. Create the file `strapi.js` in the `helpers` directory and add the following code:

```js
//path: ./tests/helpers/strapi.js
const Strapi = require("@strapi/strapi");
const fs = require("fs");

let instance;

async function setupStrapi() {
  if (!instance) {
    await Strapi().load();
    instance = strapi;
    
    await instance.server.mount();
  }
  return instance;
}

async function teardownStrapi() {
  const dbSettings = strapi.config.get("database.connection");

  //close server to release the db-file
  await strapi.server.httpServer.close();

  // close the connection to the database before deletion
  await strapi.db.connection.destroy();

  //delete test database after all tests have completed
  if (dbSettings && dbSettings.connection && dbSettings.connection.filename) {
    const tmpDbFile = dbSettings.connection.filename;
    if (fs.existsSync(tmpDbFile)) {
      fs.unlinkSync(tmpDbFile);
    }
  }
}

module.exports = { setupStrapi, teardownStrapi };
```

:::note
The command to close the database connection does not always work correctly, which results in an open handle in Jest. The `--watchAll` flag temporarily solves this problem.
:::

## Test the `strapi` instance

You need a main entry file for tests, one that will also test the `strapi` instance.

1. Create `app.test.js` in the `tests` directory.
2. Add the following code to `app.test.js`:

```js
//path: ./tests/app.test.js

const fs = require('fs');
const { setupStrapi, teardownStrapi } = require("./helpers/strapi");

beforeAll(async () => {
  await setupStrapi();
});

afterAll(async () => {
  await teardownStrapi();
});

it("strapi is defined", () => {
  expect(strapi).toBeDefined(); //confirms that the strapi instance is defined
});
```

3. Run the unit test to confirm it is working correctly:

<code-group>
<code-block title=YARN>

```sh
yarn test
```
</code-block>
<code-block title=NPM>

```sh
npm test
```
</code-block>
</code-group>

4. Confirm the test is working. The test output in the terminal window should be the following:

```bash
yarn run v1.22.18
$ jest --forceExit --detectOpenHandles
 PASS  tests/app.test.js
  ✓ strapi is defined (1 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        2.043 s, estimated 3 s
Ran all test suites.
✨  Done in 2.90s.
```

:::note

- Jest detects test files by looking for the filename `{your-file}.test.js`.

- If you receive a timeout error for Jest, please add the following line right before the `beforeAll` method in the `app.test.js` file: `jest.setTimeout(15000)` and adjust the milliseconds value as necessary.
:::

## Run a unit test

Unit tests are designed to test individual units such as functions and methods. The following procedure sets up a unit test for a function to demonstrate the functionality:

1. Create the file `sum.js` at the application root.
2. Add the following code to the `sum.js` file:

    ```js

    // path: ./sum.js

    function sum(a, b) {
    return a + b;
      }
      module.exports = sum;

    ```

3. Add the location of the code to be tested to the `app.test.js` file:

    ```js{4}

    // path: ./tests/app.test.js
    //...
    const sum = require('../sum');
    //...

4. Add the test criteria to the `app.test.js` file:

```js{4-6}

    // path: ./tests/app.test.js
    //...
    test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
    });
    //...

```

5. Save the files and run `yarn test` or `npm test` in the project root directory. Jest should return a test summary that confirms the test suite and test were successful.

## Test public endpoints

The goal of this test is to evaluate if an endpoint works properly. In this example both the route and controller logic have to work for the test to be successful. This example uses a custom route and controller, but the same structure works with APIs [generated using the Content-type Builder](/user-docs/latest/content-types-builder/creating-new-content-type.md#creating-a-new-content-type).

### Create a public route and controller

[Routes](/developer-docs/latest/development/backend-customization/routes.md) direct incoming requests to the server while [controllers](/developer-docs/latest/development/backend-customization/controllers.md) contain the business logic. For this example, the route authorizes `GET` for `/public` and calls the `hello` method in the `public` controller.

1. Add a directory `public` to `./src/api`.
2. Add sub directories `routes` and `controllers` inside the new `./src/api/public` directory.
3. Create a `public.js` file inside the `routes` directory and add the following code:

    ```js
    // path: ./src/api/public/routes/public.js

    module.exports = {
      routes: [
        {
          method: 'GET',
          path: '/public',
          handler: 'public.hello',
          config: {
            auth: false, // enables the public route
      
          },
        },
      ],
    };

    ```

4. Create a `public.js` file inside the `controllers` directory and add the following code:

    ```js
    // path: ./src/api/public/controllers/public.js

    module.exports = {
      async hello(ctx, next) {
        // called by GET /public
        ctx.body = 'Hello World!'; // A JSON can also be sent.
      },
    };

    ```

5. Save both of the `public.js` files.

### Create a public endpoint test

An endpoint test has 3 components:

- the strapi instance created in the [create a strapi instance](#create-a-strapi-instance) section,

- a `public.js` file in the `./tests` directory that contains the testing criteria,
- and a modified `app.test.js` file created in [Test the strapi instance](#test-the-strapi-instance) that contains the `Jest` test functions.

1. Create a test file `public.js` in `./tests`.
2. Add the following code to `public.js`:

    ```js

    // path: ./tests/public.js

    const request = require('supertest');

    it("should return some text here", async () => {
      await request(strapi.server.httpServer)
        .get("/api/public") //add your API route here
        .expect(200) // Expect response http code 200
        .then((data) => {
          expect(data.text).toBe("Hello World!"); // expect the response text
        });
    });
    ```

    :::tip
    The test logic can be added directly to the `app.test.js` file as well. If you write a lot of tests, using separate files for the test logic can helpful.
    :::

3. Add the following code to `./tests/app.test.js`

    ```js
    //...
    require('./public');
    //...
    ```

4. Save your code changes.
5. Run `yarn test` or `npm test` to confirm the test is successful.

## Test an authenticated API endpoint

:::prerequisites

The authenticated API endpoint test utilizes the `strapi.js` helper file created in the [Create a `strapi` instance](#create-a-strapi-instance) documentation.

:::

In order to test API endpoints that require authentication you must create a mock user as part of the test setup. In the following example the [Users and Permissions plugin](/developer-docs/latest/plugins/users-permissions.md) is used to create a mock user. The mock user is stored in the testing database and deleted at the end of the test. Testing authenticated API endpoints requires:

- modifying the `strapi.js` testing instance,
- creating a `user.js` helper file to mock a user,
- writing the authenticated route test.
- running the test.

### modify `strapi.js` testing instance

To enable authenticated route tests the `strapi.js` helper file needs to issue a JWT and set the permissions for the mock user. Add the following code to your `strapi.js` helper file:

1. Add `lodash` below `fs`:
    
    ```js
    //const Strapi = require("@strapi/strapi");
    //const fs = require("fs");
    const _ = require("lodash");
    ```

2. Add the following code to the bottom of the `strapi.js` helper file:

    ```js

    /**
   * Returns valid JWT token for authenticated
   * @param {String | number} idOrEmail, either user id, or email
   */
   const jwt = (idOrEmail) =>
    strapi.plugins["users-permissions"].services.jwt.issue({
      [Number.isInteger(idOrEmail) ? "id" : "email"]: idOrEmail,
    });

   /**
   * Grants database `permissions` table that role can access an endpoint/controllers
   *
   * @param {int} roleID, 1 Authenticated, 2 Public, etc
   * @param {string} value, in form or dot string eg `"permissions.users-permissions.controllers.auth.changepassword"`
   * @param {boolean} enabled, default true
   * @param {string} policy, default ''
   */
   const grantPrivilege = async (
     roleID = 1,
     path,
     enabled = true,
     policy = ""
    ) => {
    const service = strapi.plugin("users-permissions").service("role");

    const role = await service.findOne(roleID);

    _.set(role.permissions, path, { enabled, policy });

    return service.updateRole(roleID, role);
    };

   /** Updates database `permissions` so that role can access an endpoint
     * @see grantPrivilege
    */

   const grantPrivileges = async (roleID = 1, values = []) => {
       await Promise.all(values.map((val) => grantPrivilege(roleID, val)));
    };

   /**
     * Updates the core of strapi
     * @param {*} pluginName
     * @param {*} key
     * @param {*} newValues
    * @param {*} environment
   */

   const updatePluginStore = async (
    pluginName,
    key,
    newValues,
    environment = ""
   ) => {
    const pluginStore = strapi.store({
      environment: environment,
      type: "plugin",
      name: pluginName,
    });

   const oldValues = await pluginStore.get({ key });
    const newValue = Object.assign({}, oldValues, newValues);

   return pluginStore.set({ key: key, value: newValue });
   };

   /**
     * Get plugin settings from store
     * @param {*} pluginName
     * @param {*} key
     * @param {*} environment
    */
   const getPluginStore = (pluginName, key, environment = "") => {
    const pluginStore = strapi.store({
      environment: environment,
      type: "plugin",
      name: pluginName,
    });

   return pluginStore.get({ key });
   };

   /**
     * Check if response error contains error with given ID
     * @param {string} errorId ID of given error
     * @param {object} response Response object from strapi controller
     * @example
     *
     * const response =  {
       data: null,
       error: {
         status: 400,
         name: 'ApplicationError',
         message: 'Your account email is not confirmed',
         details: {}
       }
     }
        * responseHasError("ApplicationError", response) // true
   */

   const responseHasError = (errorId, response) => {
   return response && response.error && response.error.name === errorId;
   };

   ```

3. Add the following to `module.exports`:

    ```js
    module.exports{
     setupStrapi,
     teardownStrapi,
     jwt,
     grantPrivilege,
     grantPrivileges,
     updatePluginStore,
     getPluginStore,
     responseHasError,
     };
     ```

<!--
  Steps to do in the test application: 
    1. create an admin user with credentials
    2. login the admin user and return JWT(?)
    3. test that the user can get their info 
-->

- create a test admin user,
- login the test admin user and return a `jwt` secret,
- make an authenticated request for the user's data.

### Create a `user` helper file

A `user` helper file is used to create a mock user account in the test database. This code can be reused for other tests that also need user credentials to login or test other functionalities. To setup the `user` helper file:

1. Create `user.js` in the `./tests/helpers` directory.
2. Add the following code to the `user.js` file:

    ```js
      /**
      * Default data that factory use
      */
      const defaultData = {
        password: "1234Abc",
        provider: "local",
        confirmed: true,
      };

      /**
      * Returns random username object for user creation
      * @param {object} options that overwrites default options
      * @returns {object} object used with strapi.plugins["users-permissions"].services.user.add
      */
      const mockUserData = (options = {}) => {
        const usernameSuffix = Math.round(Math.random() * 10000).toString();
        return {
          username: `tester${usernameSuffix}`,
          email: `tester${usernameSuffix}@strapi.com`,
          ...defaultData,
          ...options,
        };
      };

      /**
      * Creates new user in strapi database
      * @param data
      * @returns {object} object of new created user, fetched from database
      */
      const createUser = async (data) => {
        /** Gets the default user role */
        const pluginStore = await strapi.store({
          type: "plugin",
          name: "users-permissions",
        });

        const settings = await pluginStore.get({
          key: "advanced",
        });

        const defaultRole = await strapi
          .query("plugin::users-permissions.role")
          .findOne({ where: { type: settings.default_role } });

        /** Creates a new user and push to database */
        return strapi
          .plugin("users-permissions")
          .service("user")
          .add({
            ...mockUserData(),
            ...data,
            role: defaultRole ? defaultRole.id : null,
          });
      };

      module.exports = {
        mockUserData,
        createUser,
        defaultData,
      };


    ```

3. Save the file.  

### Create an `auth.test.js` test file

The `auth.test.js` file contains the authenticated endpoint test conditions.

code:

```js
const { describe, beforeAll, afterAll, it, expect } = require("@jest/globals");
const request = require("supertest");
const {
  updatePluginStore,
  responseHasError,
  setupStrapi,
  stopStrapi,
} = require("./helpers/strapi");
const { createUser, defaultData, mockUserData } = require("./helpers/user");
const fs = require("fs");



beforeAll(async () => {
  await setupStrapi();
});

afterAll(async () => {
  await stopStrapi();
});

describe("Default User methods", () => {
  let user;

  beforeAll(async () => {
    user = await createUser();
  });

  it("should login user and return jwt token", async () => {
    const jwt = strapi.plugins["users-permissions"].services.jwt.issue({
      id: user.id,
    });

    await request(strapi.server.httpServer)
      .post("/api/auth/local")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        identifier: user.email,
        password: defaultData.password,
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .then(async (data) => {
        expect(data.body.jwt).toBeDefined();
        const verified = await strapi.plugins[
          "users-permissions"
        ].services.jwt.verify(data.body.jwt);

        expect(data.body.jwt === jwt || !!verified).toBe(true); 
      });
  });

  it("should return user's data for authenticated user", async () => {
    const jwt = strapi.plugins["users-permissions"].services.jwt.issue({
      id: user.id,
    });

    await request(strapi.server.httpServer)
      .get("/api/users/me")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwt)
      .expect("Content-Type", /json/)
      .expect(200)
      .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.id).toBe(user.id);
        expect(data.body.username).toBe(user.username);
        expect(data.body.email).toBe(user.email);
      });
  });

  it("should allow register users ", async () => {
    await request(strapi.server.httpServer)
      .post("/api/auth/local/register")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        ...mockUserData(),
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.jwt).toBeDefined();
        expect(data.body.user).toBeDefined();
      });
  });
});

describe("Confirmation User methods", () => {
  let user;

  beforeAll(async () => {
    await updatePluginStore("users-permissions", "advanced", {
      email_confirmation: true,
    });

    user = await createUser({
      confirmed: false,
    });
  });

  afterAll(async () => {
    await updatePluginStore("users-permissions", "advanced", {
      email_confirmation: false,
    });
  });

  it("unconfirmed user should not login", async () => {
    await request(strapi.server.httpServer)
      .post("/api/auth/local")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        identifier: user.email,
        password: defaultData.password,
      })
      .expect("Content-Type", /json/)
      .expect(400)
      .then((data) => {
        expect(responseHasError("ApplicationError", data.body)).toBe(true);
      });
  });
});
```

### Run an authenticated API endpoint test

The above test tries to:

- login an authenticated user and return a `jwt`,
- return the user's data,
- allow the registration of users,
- dissallow unauthenticated users to access the endpoint.

Use the following command to run the authenticated test:

<code-group>
<code-block title=YARN>

```sh
yarn test
```
</code-block>
<code-block title=NPM>

```sh
npm test
```
</code-block>
</code-group>


