---
title: Custom middlewares
description: Learn how to use custom middlewares using our FoodAdvisor example
displayed_sidebar: cmsSidebar
pagination_prev: cms/backend-customization/examples/routes
---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# Examples cookbook: Custom global middlewares

<NotV5/>

:::prerequisites
This page is part of the back end customization examples cookbook. Please ensure you've read its [introduction](/cms/backend-customization/examples).
:::

Out of the box, <ExternalLink to="https://github.com/strapi/foodadvisor" text="FoodAdvisor"/> does not provide any custom middlewares that could use incoming requests and perform some additional logic before executing the controller code.

There are 2 types of middlewares in Strapi: **route middlewares** control access to a route while **global middlewares** have a wider scope (see reference documentation for [middlewares customization](/cms/backend-customization/middlewares)).

Custom route middlewares could be used instead of policies to control access to an endpoint (see [policies cookbook](/cms/backend-customization/examples/policies)) and could modify the context before passing it down to further core elements of the Strapi server. This page will _not_ cover custom route middlewares but rather illustrate a more elaborated usage for **custom global middlewares**.

## Populating an analytics dashboard in Google Sheets with a custom middleware

**💭 Context:**

In essence, a middleware gets executed between a request arriving at the server and the controller function getting executed. So, for instance, a middleware is a good place to perform some analytics. 

<SideBySideContainer>

<SideBySideColumn>

Let’s create a rudimentary example of an analytics dashboard made with Google Spreadsheets to have some insights on which restaurants pages of <ExternalLink to="https://github.com/strapi/foodadvisor" text="FoodAdvisor"/> are more visited.

</SideBySideColumn>

<SideBySideColumn>

<figure style={{ width: '100%', margin: '0' }}>
  <img src="/img/assets/backend-customization/custom-global-middleware-in-action.gif" alt="Visiting a restaurant page updates the Google Sheets spreadsheet" />
  <em><figcaption style={{ fontSize: '12px' }}>Every GET request to a restaurant's page executes the code of a custom middleware, updating a Google Sheets spreadsheet in real-time.</figcaption></em>
</figure>

</SideBySideColumn>

</SideBySideContainer>

<SideBySideContainer>

<SideBySideColumn>

**🎯 Goals**:

- Create some utility functions that interact with Google Sheets.
- Create a custom Strapi middleware that will create and/or update an existing Google Sheet document every time we have an incoming request to a Restaurants page of the FoodAdvisor project.
- Append the custom middleware to the route where we want it to get executed.

</SideBySideColumn>

<SideBySideColumn>

<SubtleCallout title="Related concept">

Additional information can be found in the [middlewares customization](/cms/backend-customization/middlewares) documentation.

</SubtleCallout>

</SideBySideColumn>

</SideBySideContainer>

**🧑‍💻 Code example:**

1. In the `/api` folder of the <ExternalLink to="https://github.com/strapi/foodadvisor" text="FoodAdvisor"/> project, create a `/restaurant/middlewares/utils.js` file with the following example code:

  <details>
  <summary>Example utility functions that could be used to read, write and update a Google spreadsheet:</summary>

  The following code allows reading, writing, and updating a Google spreadsheet given an API Key read from a JSON file and a spreadsheet ID retrieved from the URL:

  ![Google Spreadsheet URL](/img/assets/backend-customization/tutorial-spreadsheet-url.png)

  Additional information can be found in the official <ExternalLink to="https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values?hl=es-419" text="Google Sheets API documentation"/>.

  ```jsx title="src/api/restaurant/middlewares/utils.js"

  const { google } = require('googleapis');

  const createGoogleSheetClient = async ({
    keyFile,
    sheetId,
    tabName,
    range,
  }) => {
    async function getGoogleSheetClient() {
      const auth = new google.auth.GoogleAuth({
        keyFile,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      const authClient = await auth.getClient();
      return google.sheets({
        version: 'v4',
        auth: authClient,
      });
    }

    const googleSheetClient = await getGoogleSheetClient();

    const writeGoogleSheet = async (data) => {
      googleSheetClient.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${tabName}!${range}`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          majorDimension: 'ROWS',
          values: data,
        },
      });
    };

    const updateoogleSheet = async (cell, data) => {
      googleSheetClient.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${tabName}!${cell}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          majorDimension: 'ROWS',
          values: data,
        },
      });
    };

    const readGoogleSheet = async () => {
      const res = await googleSheetClient.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${tabName}!${range}`,
      });

      return res.data.values;
    };

    return {
      writeGoogleSheet,
      updateoogleSheet,
      readGoogleSheet,
    };
  };

  module.exports = {
    createGoogleSheetClient,
  };
  ```

  </details>

2. In the `/api` folder of the FoodAdvisor project, create a custom `analytics` middleware with the following code:

  ```jsx title="src/api/restaurant/middlewares/analytics.js"

  'use strict';

  const { createGoogleSheetClient } = require('./utils');

  const serviceAccountKeyFile = './gs-keys.json';
  // Replace the sheetId value with the corresponding id found in your own URL
  const sheetId = '1P7Oeh84c18NlHp1Zy-5kXD8zgpoA1WmvYL62T4GWpfk';
  const tabName = 'Restaurants';
  const range = 'A2:C';

  const VIEWS_CELL = 'C';

  const transformGSheetToObject = (response) =>
    response.reduce(
      (acc, restaurant) => ({
        ...acc,
        [restaurant[0]]: {
          id: restaurant[0],
          name: restaurant[1],
          views: restaurant[2],
          cellNum: Object.keys(acc).length + 2 // + 2 because we need to consider the header and that the initial length is 0, so our first real row would be 2,
        },
      }),
      {}
    );

  module.exports = (config, { strapi }) => {
    return async (context, next) => {
      // Generating google sheet client
      const { readGoogleSheet, updateoogleSheet, writeGoogleSheet } =
        await createGoogleSheetClient({
          keyFile: serviceAccountKeyFile,
          range,
          sheetId,
          tabName,
        });
      
      // Get the restaurant ID from the params in the URL
      const restaurantId = context.params.id;
      const restaurant = await strapi.entityService.findOne(
        'api::restaurant.restaurant',
        restaurantId
      );

      // Read the spreadsheet to get the current data
      const restaurantAnalytics = await readGoogleSheet();
      
      /** 
       * The returned data comes in the shape [1, "Mint Lounge", 23],
       * and we need to transform it into an object: {id: 1, name: "Mint Lounge", views: 23, cellNum: 2}
       */
      const requestedRestaurant =
        transformGSheetToObject(restaurantAnalytics)[restaurantId];

      if (requestedRestaurant) {
        await updateoogleSheet(
          `${VIEWS_CELL}${requestedRestaurant.cellNum}:${VIEWS_CELL}${requestedRestaurant.cellNum}`,
          [[Number(requestedRestaurant.views) + 1]]
        );
      } else {
        /** If we don't have the restaurant in the spreadsheet already, 
         * we create it with 1 view.
         */
        const newRestaurant = [[restaurant.id, restaurant.name, 1]];
        await writeGoogleSheet(newRestaurant);
      }
    
      // Call next to continue with the flow and get to the controller
      await next();
    };
  };
  ```

3. Configure the routes for the "Restaurants" content-type to execute the custom `analytics` middleware whenever a restaurant page is queried. To do so, use the following code:

  ```jsx title="src/api/restaurant/routes/restaurant.js"

  'use strict';

  const { createCoreRouter } = require('@strapi/strapi').factories;

  module.exports = createCoreRouter('api::restaurant.restaurant', {
    config: {
      findOne: {
        auth: false,
        policies: [],
        middlewares: ['api::restaurant.analytics'],
      },
    },
  });
  ```

