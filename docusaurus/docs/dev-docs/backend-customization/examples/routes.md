---
title: Custom routes
description: Learn how to use custom routes using our FoodAdvisor example
displayed_sidebar: devDocsSidebar
pagination_prev: dev-docs/backend-customization/examples/policies
pagination_next: dev-docs/backend-customization/examples/middlewares
---

# Examples cookbook: Custom routes

:::prerequisites
This page is part of the back end customization examples cookbook. Please ensure you've read its [introduction](/dev-docs/backend-customization/examples).
:::

**💭 Context:**

Out of the box, [FoodAdvisor](https://github.com/strapi/foodadvisor) does not control access to its content-type endpoints.

Let's say we [previously created a policy](/dev-docs/backend-customization/examples/policies) to restrict access to the "Reviews" content-type to some conditions, for instance to prevent a restaurant's owner to create a review for their restaurants. We must now enable the policy on the route we use to create reviews.

<SideBySideContainer>

<SideBySideColumn>

**🎯 Goals**:

- Explicitly define a routes configuration for the "Reviews" content-type.
- Configure the route used when creating a review to:
  - bypass the default Strapi authentication system
  - and restrict access depending on the [previously defined custom policy](/dev-docs/backend-customization/examples/policies).

</SideBySideColumn>

<SideBySideColumn>

<SubtleCallout title="Related concept">

Additional information can be found in the [Policies](/dev-docs/backend-customization/policies) and [Routes](/dev-docs/backend-customization/routes) documentation.

</SubtleCallout>

</SideBySideColumn>

</SideBySideContainer>

**🧑‍💻 Code example:**

In the `/api` folder of the [FoodAdvisor](https://github.com/strapi/foodadvisor) project, replace the content of the `api/src/api/review/routes/review.js` file with the following code:

```jsx title="src/api/review/routes/review.js"

'use strict';

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::review.review', {
  config: {
    create: {
      auth: false, // set the route to bypass the normal Strapi authentication system
      policies: ['is-owner-review'], // set the route to use a custom policy
      middlewares: [],
    },
  },
});
```

<br />

:::strapi What's next?
Learn more about how to configure [custom middlewares](/dev-docs/backend-customization/examples/middlewares) to perform additional actions that extend your Strapi-based application.
:::
