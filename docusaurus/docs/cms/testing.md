---
title: Testing
displayed_sidebar: cmsSidebar
description: Learn how to test your Strapi application.
unlisted: true
tags:
- auth endpoint controller
- environment
---

# Unit testing

:::strapi
The Strapi blog has a tutorial on how to implement <ExternalLink to="https://strapi.io/blog/automated-testing-for-strapi-api-with-jest-and-supertest" text="API testing with Jest and Supertest"/> and <ExternalLink to="https://strapi.io/blog/how-to-add-unit-tests-to-your-strapi-plugin" text="how to add unit tests to your Strapi plugin"/>.
:::

In this guide we will see how you can run basic unit tests for a Strapi application using a testing framework.

In this example we will use <ExternalLink to="https://jestjs.io/" text="Jest"/> Testing Framework with a focus on simplicity and
<ExternalLink to="https://github.com/visionmedia/supertest" text="Supertest"/> Super-agent driven library for testing node.js HTTP servers using a fluent API.

:::caution
Please note that this guide will not work if you are on Windows using the SQLite database due to how windows locks the SQLite file.
:::

## Install test tools

`Jest` contains a set of guidelines or rules used for creating and designing test cases - a combination of practices and tools that are designed to help testers test more efficiently.

`Supertest` allows you to test all the `api` routes as they were instances of <ExternalLink to="https://nodejs.org/api/http.md#http_class_http_server" text="http.Server"/>.

`sqlite3` is used to create an on-disk database that is created and deleted between tests.

<Tabs groupId="yarn-npm">

<TabItem value="yarn" label="yarn">

```bash
yarn add --dev jest supertest sqlite3
```

</TabItem>

<TabItem value="npm" label="npm">

```bash
npm install jest supertest sqlite3 --save-dev
```

</TabItem>

</Tabs>

Once this is done add this to `package.json` file

add `test` command to `scripts` section

```json
  "scripts": {
    "develop": "strapi develop",
    "start": "strapi start",
    "build": "strapi build",
    "strapi": "strapi",
    "test": "jest --forceExit --detectOpenHandles"
  },
```

and add those lines at the bottom of file

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

Those will inform `Jest` not to look for test inside the folder where it shouldn't.

## Set up a testing environment

Test framework must have a clean empty environment to perform valid test and also not to interfere with current database.

Once `jest` is running it uses the `test` [environment](/cms/configurations/environment) (switching `NODE_ENV` to `test`)
so we need to create a special environment setting for this purpose.
Create a new config for test env `./config/env/test/database.js` and add the following value `"filename": ".tmp/test.db"` - the reason of that is that we want to have a separate sqlite database for tests, so our test will not touch real data.
This file will be temporary, each time test is finished, we will remove that file that every time tests are run on the clean database.
The whole file will look like this:

```js title="path: ./config/env/test/database.js"

module.exports = ({ env }) => ({
  connection: {
    client: 'sqlite',
    connection: {
      filename: env('DATABASE_FILENAME', '.tmp/test.db'),
    },
    useNullAsDefault: true,
    debug: false
  },
});
```

## Create a Strapi instance

In order to test anything we need to have a strapi instance that runs in the testing environment,
basically we want to get instance of strapi app as object, similar like creating an instance for <ExternalLink to="https://forum.strapi.io/t/how-to-use-pm2-process-manager-with-strapi/" text="process manager"/>.

These tasks require adding some files - let's create a folder `tests` where all the tests will be put and inside it, next to folder `helpers` where main Strapi helper will be in file strapi.js.

```js title="path: ./tests/helpers/strapi.js"
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

async function cleanupStrapi() {
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

module.exports = { setupStrapi, cleanupStrapi };
```

## Test a Strapi instance

We need a main entry file for our tests, one that will also test our helper file.

```js title="path: ./tests/app.test.js"
const fs = require('fs');
const { setupStrapi, cleanupStrapi } = require("./helpers/strapi");

beforeAll(async () => {
  await setupStrapi();
});

afterAll(async () => {
  await cleanupStrapi();
});

it("strapi is defined", () => {
  expect(strapi).toBeDefined();
});
```

Actually this is all we need for writing unit tests. Just run `yarn test` and see a result of your first test

```bash
yarn run v1.13.0
$ jest
 PASS  tests/app.test.js
  ✓ strapi is defined (2 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        4.187 s
Ran all test suites.
✨  Done in 5.73s.
```

:::tip
If you receive a timeout error for Jest, please add the following line right before the `beforeAll` method in the `app.test.js` file: `jest.setTimeout(15000)` and adjust the milliseconds value as you need.
:::

## Test a basic endpoint controller

:::tip
In the example we'll use and example `Hello world` `/hello` endpoint from [controllers](/cms/backend-customization/controllers) section.
<!-- the link below is reported to have a missing hash by the check-links plugin, but everything is fine 🤷 -->
:::

Some might say that API tests are not unit but limited integration tests, regardless of nomenclature, let's continue with testing first endpoint.

We'll test if our endpoint works properly and route `/hello` does return `Hello World`

Let's create a separate test file where `supertest` will be used to check if endpoint works as expected.

```js title="path: ./tests/hello/index.js"

const request = require('supertest');

it("should return hello world", async () => {
  await request(strapi.server.httpServer)
    .get("/api/hello")
    .expect(200) // Expect response http code 200
    .then((data) => {
      expect(data.text).toBe("Hello World!"); // expect the response text
    });
});

```

Then include this code to `./tests/app.test.js` at the bottom of that file

```js
require('./hello');
```

and run `yarn test` which should return

```bash
➜  my-project yarn test
yarn run v1.13.0
$ jest --detectOpenHandles
 PASS  tests/app.test.js (5.742 s)
  ✓ strapi is defined (4 ms)
  ✓ should return hello world (208 ms)

[2020-05-22T14:37:38.018Z] debug GET /hello (58 ms) 200
Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        6.635 s, estimated 7 s
Ran all test suites.
✨  Done in 9.09s.
```

:::tip
If you receive an error `Jest has detected the following 1 open handles potentially keeping Jest from exiting` check `jest` version as `26.6.3` works without an issue.
:::

## Test an `auth` endpoint controller

In this scenario we'll test authentication login endpoint with two tests

1. Test `/auth/local` that should login user and return `jwt` token
2. Test `/users/me` that should return users data based on `Authorization` header


```js title="path: ./tests/user/index.js"
const request = require('supertest');

// user mock data
const mockUserData = {
  username: "tester",
  email: "tester@strapi.com",
  provider: "local",
  password: "1234abc",
  confirmed: true,
  blocked: null,
};

it("should login user and return jwt token", async () => {
  /** Creates a new user and save it to the database */
  await strapi.plugins["users-permissions"].services.user.add({
    ...mockUserData,
  });

  await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .post("/api/auth/local")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .send({
      identifier: mockUserData.email,
      password: mockUserData.password,
    })
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
      expect(data.body.jwt).toBeDefined();
    });
});

it('should return users data for authenticated user', async () => {
  /** Gets the default user role */
  const defaultRole = await strapi.query('plugin::users-permissions.role').findOne({}, []);

  const role = defaultRole ? defaultRole.id : null;

  /** Creates a new user an push to database */
  const user = await strapi.plugins['users-permissions'].services.user.add({
    ...mockUserData,
    username: 'tester2',
    email: 'tester2@strapi.com',
    role,
  });

  const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
    id: user.id,
  });

  await request(strapi.server.httpServer) // app server is an instance of Class: http.Server
    .get('/api/users/me')
    .set('accept', 'application/json')
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + jwt)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(data => {
      expect(data.body).toBeDefined();
      expect(data.body.id).toBe(user.id);
      expect(data.body.username).toBe(user.username);
      expect(data.body.email).toBe(user.email);
    });
});
```

Then include this code to `./tests/app.test.js` at the bottom of that file

```js
require('./user');
```

All the tests above should return an console output like

```bash
➜  my-project git:(master) yarn test

yarn run v1.13.0
$ jest --forceExit --detectOpenHandles
[2020-05-27T08:30:30.811Z] debug GET /hello (10 ms) 200
[2020-05-27T08:30:31.864Z] debug POST /auth/local (891 ms) 200
 PASS  tests/app.test.js (6.811 s)
  ✓ strapi is defined (3 ms)
  ✓ should return hello world (54 ms)
  ✓ should login user and return jwt token (1049 ms)
  ✓ should return users data for authenticated user (163 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        6.874 s, estimated 9 s
Ran all test suites.
✨  Done in 8.40s.
```
