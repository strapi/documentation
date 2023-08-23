---
title: Backend Customization Example
description: Learn how to use the core backend features of Strapi with the FoodAdvisor deployment
displayed_sidebar: devDocsSidebar
---

import TOCInline from '@theme/TOCInline';

# Backend customization: An advanced example tutorial with FoodAdvisor

:::prerequisites
- You have read the [backend customization introduction](/dev-docs/backend-customization) to get a general understanding of what routes, policies, middlewares, controllers, and services are in Strapi.
- If you want to test and play with the code examples by yourself, ensure you have cloned the [FoodAdvisor](https://github.com/strapi/foodadvisor#1-clone-foodadvisor) repository and setup the project. The Strapi admin panel should be accessible from [`localhost:1337/admin`](http://localhost:1337/admin) and the Next.js-based FoodAdvisor front-end website should be running on [`localhost:3000`](http://localhost:3000).
:::

The present advanced example tutorial demonstrates how the core components of the back-end server of Strapi can be used in a real-world project. The example project we will use is [FoodAdvisor](https://github.com/strapi/foodadvisor), the official Strapi demo application. FoodAdvisor builds a ready-made restaurants directory powered by a Strapi back end (included in the `/api` folder) and renders a [Next.js](https://nextjs.org/)-powered front-end website (included in the `/client` folder).

<!-- We will: -->
<!-- TODO add list? -->

This tutorial will also use some code for front-end pages. Though this front-end code is outside the scope of Strapi back end customization, including it illustrates how the end user can interact with your Strapi-powered website and how actions on the front end interplay with core components from the Strapi back end server.

<!-- <TOCInline toc={toc} /> -->

## Authentication flow with JWT

<SideBySideContainer>

<SideBySideColumn>

Before diving deeper into the backend customization of Strapi, let's add a basic login page to the front-end part of FoodAdvisor. The following example code renders a login page with elements from the [Formik](https://formik.org/) library.

Submitting the form sends a request to the `/auth/local` route of the Strapi backend server and returns a JSON Web Token (JWT) that will be stored into the [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) property of your browser for later retrieval and authentication of your requests.

To achieve this, in the `client` folder of the FoodAdvisor project, you could create a `pages/auth/login.js` file that contains the following example code:

</SideBySideColumn>

<SideBySideColumn>

:::strapi Related concept: Authentication
The code presented in this section uses JWT authentication from the Strapi built-in Users & Permissions plugin.

Additional information can be found in the [Users & Permissions plugin](/dev-docs/plugins/users-permissions) documentation.
:::

</SideBySideColumn>
</SideBySideContainer>

<details>
<summary>Example code for a basic login view that stores a JWT in localStorage:</summary>

Highlighted lines show the request sent to the `/auth/local` route provided by Strapi's Users & Permissions plugin:

```jsx title="/client/pages/auth/login.js" {21-27}

import React from 'react';
import { useFormik } from 'formik';
import { Button, Input } from '@nextui-org/react';
import Layout from '@/components/layout';
import { getStrapiURL } from '@/utils';

const Login = () => {
  const { handleSubmit, handleChange } = useFormik({
    initialValues: {
      identifier: '',
      password: '',
    },
    onSubmit: async (values) => {
      /**
       * API URLs in Strapi are by default prefixed with /api,
       * but because the API prefix can be configured
       * with the rest.prefix property in the config/api.js file,
       * we use the getStrapiURL() method to build the proper full auth URL.
       **/
      const res = await fetch(getStrapiURL('/auth/local'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      const { jwt } = await res.json();
			/**
       * Stores the JWT authentication token in the localStorage. 
       * A better implementation would be to do this with an authentication context provider
       * or something more sophisticated, but it's not the purpose of this tutorial.
       */
      localStorage.setItem('token', jwt); 
    },
  });
  /**
   * The following code renders a basic login form 
   * accessible from the localhost:3000/auth/login page.
   */
  return (
    <Layout>
      <div className="h-full w-full flex justify-center items-center my-24">
        <form onSubmit={handleSubmit} className="flex flex-col gap-y-6 w-4/12 ">
          <h1 className="font-bold text-3xl mb-6">Login</h1>
          <Input
            onChange={handleChange}
            type="email"
            name="identifier"
            label="Email"
            placeholder="Enter your email"
          />
          <Input
            type="password"
            name="password"
            label="Password"
            placeholder="Enter your password"
            onChange={handleChange}
          />
          <Button type="submit" className="bg-primary rounded-md text-muted">
            Login
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default Login;
```

</details>

## Services and Controllers: Writing a review

With FoodAdvisor, you can browse a list of restaurants accessible at [`localhost:3000/restaurants`](http://localhost:3000/restaurants). Clicking on any restaurant from the list will use the code included in the `/client` folder to display additional information about this restaurant. The content displayed on a restaurant page was created within Strapi's Content Manager and is retrieved by querying Strapi's REST API which uses code included in the `/api` folder.

<SideBySideContainer>
<SideBySideColumn>

Out of the box, restaurant pages on the front-end website of FoodAdvisor include a Reviews section that is read-only. Adding or updating reviews requires logging in to Strapi's admin panel and entering data into the Content Manager.

We will add a simple front-end component to restaurant pages to allow a front-end user to write a review directly from the front-end website.

</SideBySideColumn>

<SideBySideColumn>

![Writing a review on the front end](/img/assets/backend-customization/tutorial-write-review.png)

</SideBySideColumn>

</SideBySideContainer>

<details>
<summary>Example front-end code to add a component for writing reviews and display it on restaurants pages:</summary>

Create a new file in the `/client` folder to add a new component for writing reviews with the following code:

```jsx title='/client/components/pages/restaurant/RestaurantContent/Reviews/new-review.js'

import { Button, Input, Textarea } from '@nextui-org/react';
import { useFormik } from 'formik';
import { useRouter } from 'next/router';
import React from 'react';
import { getStrapiURL } from '../../../../../utils';

const NewReview = () => {
  const router = useRouter();

  const { handleSubmit, handleChange, values } = useFormik({
    initialValues: {
      note: '',
      content: '',
    },
    onSubmit: async (values) => {
      /**
       * Queries Strapi REST API to create the review
       * using the JWT previously stored in localStorage
       */
      const res = await fetch(getStrapiURL('/reviews'), {
        method: 'POST',
        body: JSON.stringify({
          restaurant: router.query.slug,
          ...values,
        }),
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
    },
  });
  /**
   * Renders the form
   */
  return (
    <div className="my-6">
      <h1 className="font-bold text-2xl mb-3">Write your review</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
        <Input
          onChange={handleChange}
          name="note"
          type="number"
          min={1}
          max={5}
          label="Stars"
        />
        <Textarea
          name="content"
          onChange={handleChange}
          placeholder="What do you think about this restaurant?"
        />
        <Button
          type="submit"
          className="bg-primary text-white rounded-md self-start"
        >
          Send
        </Button>
      </form>
    </div>
  );
};

export default NewReview;
```

Display the new component on any restaurants page by adding the highlighted lines (7, 8, and 13) to the code used to render restaurant's information:

```jsx title='/client/components/pages/restaurant/RestaurantContent/Reviews/reviews.js' showLineNumbers
import React from 'react';
import delve from 'dlv';

import { formatDistance } from 'date-fns';

import { getStrapiMedia } from '../../../../../utils';
// highlight-start
import { Textarea } from '@nextui-org/react';
import NewReview from './new-review';
// highlight-end

const Reviews = ({ reviews }) => {
  return (
    <div className="col-start-2 col-end-2 mt-24">
      // highlight-next-line
      <NewReview />
      {reviews &&
        reviews.map((review, index) => (
  // …

```

</details>

We will then customize Strapi's back end server: submitting the review form will create a review in the Strapi back end and notify the restaurant owner by email. Translating this to Strapi back end customization means performing 3 actions:

1. Creating a custom service to [create the review](#custom-service-creating-a-review).
2. Creating a custom service to [send an email](#custom-service-sending-an-email-to-the-restaurant-owner).
3. [Customizing the default controller](#custom-controller) provided by Strapi for the Review content-type to use the 2 new services instead of only rendering the reviews.

### Custom service: Creating a review

<SideBySideContainer>

<SideBySideColumn>

By default, service files in Strapi includes basic boilerplate code that use the `createCoreService` factory function.

We will update the service file for the Review content-type by replacing its code. The new code:

- declares a `create` method,
- grabs [context](/dev-docs/backend-customization/requests-responses) from the request,
- uses the `findMany()` method from the [EntityService API](/dev-docs/api/entity-service) to find a restaurant,
- uses the `create()` method from the EntityService API to append data to the restaurant, [populating](/dev-docs/api/entity-service/populate) the restaurant owner,
- and returns the new review data.
    
</SideBySideColumn>

<SideBySideColumn>

:::strapi Related concept: Controllers
The code presented in this section uses one of the possible ways to customize a default controller.

Additional information can be found in the [Controllers](/dev-docs/backend-customization/controllers) documentation.
:::

</SideBySideColumn>

</SideBySideContainer>

Use the following code example:

```jsx title="/api/src/api/review/services/review.js"
const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::review.review', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    const { body } = ctx.request;

    const restaurants = await strapi.entityService.findMany(
      'api::restaurant.restaurant',
      {
        filters: {
          slug: body.restaurant,
        },
      }
    );

    const newReview = await strapi.entityService.create('api::review.review', {
      data: {
        note: body.note,
        content: body.content,
        restaurant: restaurants[0].id,
        author: user.id,
      },
      populate: ['restaurant.owner'],
    });

    return newReview;
  },
}));
```

In a controller's code, the `create` method from this service can be called with `strapi.service('api::review.review').create(ctx)` where `ctx` is the request's context.

:::note
The provided example code only handles the "happy path". You should also consider handling the different potential errors, for instance when the restaurant doesn’t exist.
:::

### Custom Service: Sending an email to the restaurant owner
    
    ⚠️ You need to [setup the email provider](https://docs.strapi.io/dev-docs/plugins/email). And also, for this service, I created a Single Type that holds the email configuration:
    
    ![Email Single Type in Admin Panel](/img/assets/backend-customization/tutorial-single-type.png)
    
    
  ```jsx
  // src/api/email/services/email.js

  const { createCoreService } = require('@strapi/strapi').factories;

  module.exports = createCoreService('api::email.email', ({ strapi }) => ({
    async send({ to, subject, html }) {
      const emailConfig = await strapi.entityService.findOne(
        'api::email.email',
        1
      );

      await strapi.plugins['email'].services.email.send({
        to,
        subject,
        html,
        from: emailConfig.from,
      });
    },
  }));
  ```

### Custom controller

And mixing everything together in the review **controller** we get a customized POST controller that handles the creation of the review and also sends the email:

```jsx
// Server side - api/review/controllers/review.js

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::review.review', ({ strapi }) => ({
  async create(ctx) {
    const newReview = await strapi.service('api::review.review').create(ctx);

    if (newReview.restaurant?.owner) {
      await strapi.service('api::email.email').send({
        to: newReview.restaurant.owner.email,
        subject: 'You have a new review!',
        html: `You've received a ${newReview.note} star review: ${newReview.content}`,
      });
    }

    const sanitizedReview = await this.sanitizeOutput(newReview, ctx);

    ctx.body = sanitizedReview;
  },
}));
```




## Policies

Now that we can create reviews as authenticated users, there is a problem. The owners of the restaurants can create fake reviews 😱. So what can we do to stop them from doing it? We can create custom policies that would apply as a permission filter in the specified routes. In this case, we want to create a custom policy to prevent restaurant owners from creating reviews for their restaurants. How can we do that? We can create a `policies` folder inside the `review` content type to create a policy that only applies to that content type. And inside, a file with the name `is-restaurant-owner`.js

```jsx
// src/api/review/policies/is-owner-review.js

const { errors } = require('@strapi/utils');
const { PolicyError } = errors;

module.exports = async (policyContext, config, { strapi }) => {
  const { body } = policyContext.request;
  const { user } = policyContext.state;

  if (!user) {
    return false;
  }
  const filteredRestaurants = await strapi.entityService.findMany(
    'api::restaurant.restaurant',
    {
      filters: {
        slug: body.restaurant,
      },
      populate: ['owner'],
    }
  );

  const restaurant = filteredRestaurants[0];

  if (!restaurant) {
    return false;
  }

  // If the user submitting the request is the owner of the restaurant we don't allow the review creation
  if (user.id === restaurant.owner.id) {
		// We can throw custom policy errors instead of just return false (which would result into a generic Policy Error)
    throw new PolicyError('The owner of the restaurant cannot submit reviews', {
      errCode: 'RESTAURANT_OWNER_REVIEW', // can be useful for frontend identification of different errors
    });
  }

  return true;
};
```

## Routes

To make the reviews policy work, we need to enable it by appending it to the route we use to create reviews, and to do that we write the following:

```jsx
// src/api/review/routes/review.js

'use strict';

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::review.review', {
  config: {
    create: {
      auth: false,
      policies: ['is-owner-review'],
      middlewares: [],
    },
  },
});
```

<aside>
ℹ️ [Different Policy Errors](https://docs.strapi.io/dev-docs/error-handling#policies)

### Default Policy Error

```jsx
{
    "data": null,
    "error": {
        "status": 403,
        "name": "PolicyError",
        "message": "Policy Failed",
        "details": {}
    }
}
```

### Custom Policy Error

```jsx
{
    "data": null,
    "error": {
        "status": 403,
        "name": "PolicyError",
        "message": "The owner of the restaurant cannot submit reviews",
        "details": {
            "policy": "is-owner-review",
            "errCode": "RESTAURANT_OWNER_REVIEW"
        }
    }
}
```

</aside>

Now, we can easily catch the error from the frontend and display it with a [Toast Notification](https://github.com/timolins/react-hot-toast). 

![Restaurant owner can't submit reviews](/img/assets/backend-customization/tutorial-owner-cantsubmit.png)

![Write review success](/img/assets/backend-customization/tutorial-write-review-success.png)

```jsx
// Errors 
class UnauthorizedError extends Error {
	// You can use a custom error implementation to be able to distinguish it better
	// from other types of errors
  constructor(message) {
    super(message);
  }
}

// components/pages/restaurant/RestaurantContent/Reviews/new-review.js
[...]
try{
	[...]
	const { error } = await res.json();
	if (error) {
	  throw new UnauthorizedError(error.message);
	}
	toast.success('Review created!');
}catch(err){
	toast.error(err.message)
}
[...]
```

### Middleware

Now that we’ve seen the power of policies for access control, you might be wondering what you can use middlewares for, and even though you could use them for the same as policies, they have more appropriate use cases. In essence, a middlware is something that gets executed in between a request arriving at the server and the controller function getting executed. So, for instance, it’s a good place to post our analytics. Let’s create a rudimentary example of an analytics dashboard made with Google Spreadsheets to have some insights on which restaurants are more visited. Every time we have an incoming request to `/restaurants/:id` we need to run the analytics middleware and update our spreadsheet. First, let’s build some functions that will help us interact with our Spreadsheet, to get more details about it [refer to its documentation](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values?hl=es-419).

```jsx
// src/api/restaurant/middlewares/utils.js

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

Basically, the code above will let us **read, write and update a Google spreadsheet** given an API Key read from a JSON file and a spreadsheet ID retrieved from the URL:

![Google Spreadsheet URL](/img/assets/backend-customization/tutorial-spreadsheet-url.png)

Now we can create the Middleware function in a file named `analytics.` inside the `middlewares` folder.

```jsx
// src/api/restaurant/middlewares/analytics.js

'use strict';

const { createGoogleSheetClient } = require('./utils');

const serviceAccountKeyFile = './gs-keys.json';
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
    console.log('Coming to the middleware');
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
		
		// The return data comes in the shape [1, "Mint Lounge", 23], and we need to transform it into an object: {id: 1, name: "Mint Lounge", views: 23, cellNum: 2}
    const requestedRestaurant =
      transformGSheetToObject(restaurantAnalytics)[restaurantId];

    if (requestedRestaurant) {
      await updateoogleSheet(
        `${VIEWS_CELL}${requestedRestaurant.cellNum}:${VIEWS_CELL}${requestedRestaurant.cellNum}`,
        [[Number(requestedRestaurant.views) + 1]]
      );
    } else {
			// If we don't have the restaurant in the spreadsheet already, we create it with 1 view, of course.
      const newRestaurant = [[restaurant.id, restaurant.name, 1]];
      await writeGoogleSheet(newRestaurant);
    }
	
		// Call next to continue with the flow and get to the controller
    next();
  };
};
```

![Google Spreadsheet data](/img/assets/backend-customization/tutorial-spreadsheet-data.png)

Now, as we did in the policies, we need to append the middleware to the route where we want it to get executed:

```jsx
// src/api/restaurant/routes/restaurant.js

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

This video shows how the middleware gets executed in every request, updating the spreadsheet and generating new data:

https://www.loom.com/share/ef9aba68923345b39b6c290501c171b2


