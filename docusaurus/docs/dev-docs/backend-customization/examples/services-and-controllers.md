---
title: Custom services and controllers
description: Learn how to authenticate use custom services and controllers using our FoodAdvisor example
displayed_sidebar: devDocsSidebar
pagination_prev: dev-docs/backend-customization/examples/authentication
pagination_next: dev-docs/backend-customization/examples/policies
---

# Examples cookbook: Custom services and controllers

:::prerequisites
This page is part of the back end customization examples cookbook. Please ensure you've read its [introduction](/dev-docs/backend-customization/examples).
:::

From the front-end website of [FoodAdvisor](https://github.com/strapi/foodadvisor), you can browse a list of restaurants accessible at [`localhost:3000/restaurants`](http://localhost:3000/restaurants). Clicking on any restaurant from the list will use the code included in the `/client` folder to display additional information about this restaurant. The content displayed on a restaurant page was created within Strapi's Content Manager and is retrieved by querying Strapi's REST API which uses code included in the `/api` folder.

In this page we will customize both:

- the [front-end website](#rest-api-queries-from-the-front-end) to add a form allowing website visitors to write a review,
- and the back-end server of Strapi to leverage custom [services and controllers](#controllers-vs-services) to perform specific actions whenever a review is created.

### REST API queries from the front end

<SideBySideContainer>
<SideBySideColumn>

Restaurant pages on the front-end website of [FoodAdvisor](https://github.com/strapi/foodadvisor) include a Reviews section that is read-only. Adding reviews requires logging in to Strapi's admin panel and adding content to the "Reviews" collection type through the [Content Manager](/user-docs/content-manager).

Let's add a small front-end component to restaurant pages. This component will allow a user to write a review directly from the front-end website.

</SideBySideColumn>

<SideBySideColumn>

![Writing a review on the front end](/img/assets/backend-customization/tutorial-write-review.png)

</SideBySideColumn>

</SideBySideContainer>

<SideBySideContainer>
<SideBySideColumn>

Our goal is to:

* add a form to write a review,
* display the form on any restaurants page,
* send a POST request to Strapi's REST API when the form is submitted,
* and use the [previously stored JWT](#authentication-flow-with-jwt) to authenticate the request.

</SideBySideColumn>

<SideBySideColumn>

:::strapi Related concept: REST API
The front-end code presented in this page uses [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to reach a content type endpoint on the back-end server of Strapi.

Additional information on endpoints for content types can be found in the [REST API](/dev-docs/api/rest#endpoints) documentation.
:::

</SideBySideColumn>

</SideBySideContainer>

To achieve this, in the `/client` folder of the FoodAdvisor project, you could use the following code examples to:
- create a new `pages/restaurant/RestaurantContent/Reviews/new-review.js` file,
- and update the existing `components/pages/restaurant/RestaurantContent/Reviews/reviews.js`.

<details>
<summary>Example front-end code to add a component for writing reviews and display it on restaurants pages:</summary>

1. Create a new file in the `/client` folder to add a new component for writing reviews with the following code:

  ```jsx title='/client/components/pages/restaurant/RestaurantContent/Reviews/new-review.js'

  import { Button, Input, Textarea } from '@nextui-org/react';
  // highlight-start
  /** 
   * The form uses the Formik library (https://formik.org/).
   * Formik should be added to your project's dependencies;
   * Use yarn or npm to install it and it will be added to your package.json file.
   */
  import { useFormik } from 'formik';
  // highlight-end
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
         * Queries Strapi REST API to reach the reviews endpoint
         * using the JWT previously stored in localStorage to authenticate
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

2. Display the new form component on any restaurants page by adding the highlighted lines (7, 8, and 13) to the code used to render restaurant's information:

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

### Controllers vs. Services

Controllers could contain any business logic to be executed when the client requests a route. To illustrate the use of services, in this documentation the custom controller does not handle any responsibilities and delegate all the business logic to services.

Let's say we would like to customize the back end of [FoodAdvisor](https://github.com/strapi/foodadvisor) to achieve the following scenario: when submitting the [previously added review form](#rest-api-queries-from-the-front-end) on the front-end website, Strapi will create a review in the back end and notify the restaurant owner by email. Translating this to Strapi back end customization means performing 3 actions:

1. Creating a custom service to [create the review](#custom-service-creating-a-review).
2. Creating a custom service to [send an email](#custom-service-sending-an-email-to-the-restaurant-owner).
3. [Customizing the default controller](#custom-controller) provided by Strapi for the Review content-type to use the 2 new services.

### Custom service: Creating a review

By default, service files in Strapi includes basic boilerplate code that use the `createCoreService` factory function.

Let's update the existing `review.js` service file for the "Reviews" collection type of [FoodAdvisor](https://github.com/strapi/foodadvisor) by replacing its code to create a review.

<SideBySideContainer>

<SideBySideColumn>

Our goal is to:

- declare a `create` method,
- grab [context](/dev-docs/backend-customization/requests-responses) from the request,
- use the `findMany()` method from the [EntityService API](/dev-docs/api/entity-service) to find a restaurant,
- use the `create()` method from the EntityService API to append data to the restaurant, [populating](/dev-docs/api/entity-service/populate) the restaurant owner,
- and return the new review data.
    
</SideBySideColumn>

<SideBySideColumn>

:::strapi Related concepts: Services, EntityService API
The code presented in this section uses one of the possible ways to create a service. The code also illustrates the use of the Entity Service API to query content directly from the back-end server.

Additional information can be found in the [Services](/dev-docs/backend-customization/services) and [EntityService API](/dev-docs/api/entity-service) documentation.
:::

</SideBySideColumn>

</SideBySideContainer>

To create such a service, in the `/api` folder of the FoodAdvisor project, replace the content of the `src/api/review/services/review.js` file with the following code:

```jsx title="src/api/review/services/review.js"
const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::review.review', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    const { body } = ctx.request;

    /**
     * Queries the Restaurants collection type
     * using the Entity Service API
     * to retrieve information about the restaurant.
     */
    const restaurants = await strapi.entityService.findMany(
      'api::restaurant.restaurant',
      {
        filters: {
          slug: body.restaurant,
        },
      }
    );

    /**
     * Creates a new entry for the Reviews collection type
     * and populates data with information about the restaurant's owner
     * using the Entity Service API.
     */
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

:::tip Tips
- In a controller's code, the `create` method from this service can be called with `strapi.service('api::review.review').create(ctx)` where `ctx` is the request's [context](/dev-docs/backend-customization/requests-responses).
- The provided example code does not cover error handling. You should consider handling errors, for instance when the restaurant does not exist. Additional information can be found in the [Error handling](/dev-docs/error-handling) documentation.
:::

### Custom Service: Sending an email to the restaurant owner

Out of the box, [FoodAdvisor](https://github.com/strapi/foodadvisor) does not provide any automated email service feature.

Let's create an `email.js` service file to send an email. We could use it in a [custom controller](#custom-controller) to notify the restaurant owner whenever a new review is created on the front-end website.

:::callout 🤗 Optional service
This service is an advanced code example using the [Email](/dev-docs/plugins/email) plugin and requires understanding how [plugins](/dev-docs/plugins) and [providers](/dev-docs/providers) work with Strapi. If you don't need an email service to notify the restaurant's owner, you can skip this part and jump next to the custom [controller](#custom-controller) example.
:::

<SideBySideContainer>
<SideBySideColumn>

:::prerequisites
- You have setup a [provider for the Email plugin](/dev-docs/plugins/email), for instance the [Sendmail](https://www.npmjs.com/package/@strapi/provider-email-sendmail) provider.
- In Strapi's admin panel, you have [created an `Email` single type](/user-docs/content-type-builder/creating-new-content-type#creating-a-new-content-type) that contains a `from` Text field to define the sender email address.
:::

</SideBySideColumn>

<SideBySideColumn>

![Email Single Type in Admin Panel](/img/assets/backend-customization/tutorial-single-type.png)

</SideBySideColumn>

</SideBySideContainer>

<SideBySideContainer>
<SideBySideColumn >

Our goal is to:
- create a new service file for the "Email" single type,
- declare a `send()` method for this service,
- grab the sender address stored in the Email single type using the [Entity Service API](/dev-docs/api/entity-service),
- use email details (recipient's address, subject, and email body) passed when invoking the service's `send()` method to send an email using the [Email plugin](/dev-docs/plugins/email) and a previously configured [provider](/dev-docs/providers).

</SideBySideColumn>

<SideBySideColumn>

:::strapi Related concepts: Services, EntityService API
The code presented in this section uses one of the possible ways to create a service. The code also illustrates the use of the Entity Service API to query content directly from the back-end server.

Additional information can be found in the [Services](/dev-docs/backend-customization/services) and [EntityService API](/dev-docs/api/entity-service) documentation.
:::

</SideBySideColumn>

</SideBySideContainer>

To create such a service, in the `/api` folder of the FoodAdvisor project, create a new `src/api/email/services/email.js` file with the following code:
    
  ```jsx title="src/api/email/services/email.js"

  const { createCoreService } = require('@strapi/strapi').factories;

  module.exports = createCoreService('api::email.email', ({ strapi }) => ({
    async send({ to, subject, html }) {
      /**
       * Retrieves email configuration data
       * stored in the Email single type
       * using the Entity Service API.
       */
      const emailConfig = await strapi.entityService.findOne(
        'api::email.email',
        1
      );

      /**
       * Sends an email using:
       * - parameters to pass when invoking the service
       * - the 'from' address previously retrieved with the email configuration
       */
      await strapi.plugins['email'].services.email.send({
        to,
        subject,
        html,
        from: emailConfig.from,
      });
    },
  }));
  ```

:::tip
In a controller's code, the `send` method from this email service can be called with `strapi.service('api::email.email).send(parameters)` where `parameters` is an object with the email's related information (recipient's address, subject, and email body).
:::

### Custom controller

By default, controllers files in Strapi includes basic boilerplate code that use the `createCoreController` factory function. This exposes basic methods to create, retrieve, update, and delete content when reaching the requested endpoint. The default code for the controllers can be customized to perform any business logic.

Let's customize the default controller for the "Reviews" collection type of [FoodAdvisor](https://github.com/strapi/foodadvisor) with the following scenario: upon a `POST` request to the `/reviews` endpoint, the controller calls previously created services to both [create a review](#custom-service-creating-a-review) and [send an email](#custom-service-sending-an-email-to-the-restaurant-owner) to the restaurant's owner.

<SideBySideContainer>
<SideBySideColumn>

Our goal is to:

- extend the existing controller for the "Reviews" collection type,
- declare a custom `create()` method,
- call previously created service(s),
- and sanitize the content to be returned.

</SideBySideColumn>

<SideBySideColumn>

:::strapi Related concept: Controllers
The code presented in this section uses one of the possible ways to customize a controller.

Additional information can be found in the [Controllers](/dev-docs/backend-customization/controllers) documentation.
:::

</SideBySideColumn>

</SideBySideContainer>

To achieve this, in the `/api` folder of the FoodAdvisor project, replace the content of the `src/api/review/controllers/review.js` file with one of the following code examples, depending on whether you previously created just [one custom service](#custom-service-creating-a-review) or both custom services for the review creation and the [email notification](#custom-service-sending-an-email-to-the-restaurant-owner):

<Tabs>
<TabItem value="create-only" label="Custom controller with one service">

```jsx title="src/api/review/controllers/review.js"

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::review.review', ({ strapi }) => ({
  async create(ctx) {
    // Creates the new review using a service
    const newReview = await strapi.service('api::review.review').create(ctx);

    const sanitizedReview = await this.sanitizeOutput(newReview, ctx);

    ctx.body = sanitizedReview;
  },
}));
```

</TabItem>

<TabItem value="create-and-email" label="Custom controller with both services">

```jsx title="src/api/review/controllers/review.js"

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::review.review', ({ strapi }) => ({
  async create(ctx) {
    // Creates the new review using a service
    const newReview = await strapi.service('api::review.review').create(ctx);

    // Sends an email to the restaurant's owner, using another service
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

</TabItem>

</Tabs>




<br />

:::strapi What's next?
Learn more about how [custom policies](/dev-docs/backend-customization/examples/policies) can help you tweak a Strapi-based application and restrict access to some resources based on specific conditions.
:::
