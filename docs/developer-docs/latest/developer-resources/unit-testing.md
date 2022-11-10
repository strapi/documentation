---
title: Unit and Route Testing - Strapi Developer Docs
description: Learn in this guide how you can run basic unit tests for a Strapi application using a testing framework.
sidebarDepth: 2
canonicalUrl: https://docs.strapi.io/developer-docs/latest/guides/unit-testing.html
---

# Unit and Route Testing

Testing code units and API routes in a Strapi application can be done with [Jest](https://jestjs.io/) and [Supertest](https://github.com/visionmedia/supertest), with an SQLite database. This documentation describes implementing:

- a unit test for a function,
- a public API endpoint unit test,
- and an API endpoint unit test with authorization.

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
npm install better-sqlite3 --save-dev
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
    "test": "jest --forceExit --detectOpenHandles"
  },
```

3. Add a `jest` section to the `package.json` file with the following code:

```json
//path: ./package.json
//...
  "jest": {
    "testPathIgnorePatterns": [ //informs Jest to ignore these directories.
      "/node_modules/",
      ".tmp",
      ".cache"
    ],
    "testEnvironment": "node"
  }
  //...
```

## Create a testing environment

The testing environment should test the application code without affecting the database, and should be able to run distinct units of the application to incrementally test the code functionality. To achieve this the following instructions will add:

- a testing database,
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

The testing environment requires a `strapi` instance as an object, similar to creating an instance for the [process manager](/developer-docs/latest/setup-deployment-guides/deployment/optional-software/process-manager.md). `strapi.js`.

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

::: note
The command to close the database connection is not working, which results in an open handle in Jest. The `--force-exit` flag temporarily solves this problem.
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
  expect(strapi).toBeDefined(); //tests that the strapi instance exists
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

The goal of this test is to evaluate if an endpoint works properly. In this example both the route and controller logic have to work for the test to be successul. This example uses a custom route and controller, but the same structure works with APIs [generated using the Content-type Builder](/user-docs/latest/content-types-builder/creating-new-content-type.md#creating-a-new-content-type).

### Create a public route and controller

Routes direct incoming requests to the server while controllers contain the business logic. For this example, the route authorizes `GET` for `/public` and calls the `hello` method in the `public` controller.

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

5. Save both `public.js` files.

### Create a public endpoint test

An endpoint test has 3 components:

- the strapi instance created in the [create a strapi instance](#create-a-strapi-instance) section,
- a modified `app.test.js` file created in [Test the strapi instance](#test-the-strapi-instance) that contains the `Jest` test functions,
- and a `public.js` file in the `./tests` directory that contains the testing criteria.

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

3. Add the following code to `./tests/app.test.js

    ```js
    //...
    require('./public');
    //...
    ```

4. Save your code changes.
5. run `yarn test` or `npm test` to confirm the test is successful.

## Test an authenticated API endpoint

::: prerequisite

The authenticated API endpoint test utilizes the `strapi.js` helper file created in the [Create a `strapi` instance](#create-a-strapi-instance) documentation.

:::

Testing authenticated API endpoints requires:

- create a test user,
- login the test user and return a `jwt` secret,
- make an authenticated request for the user's data.

### Create a `createUser` helper file

A `createUser` helper file is used to create a mock user account in the test database. This code can be reused for other tests that also need user credentials to login or test other functionalities. To setup the `createUser` helper file:

1. Create `createUser.js` in the `./tests/helpers` directory.
2. Add the following code to the `createUser.js` file:

    ```js


    ```

3. Save the file.  


### Create an `auth.test.js` test file

The `auth.test.js` file contains the authenticated endpoint test conditions. 


### Run an authenticated API endpoint test







