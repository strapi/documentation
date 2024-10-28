---
title: Authentication flow with JWT
description: Learn how to authenticate REST API queries using our FoodAdvisor example
displayed_sidebar: devDocsSidebar
pagination_prev: dev-docs/backend-customization/examples
pagination_next: dev-docs/backend-customization/examples/services-and-controllers
---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# Examples cookbook: Authentication flow with JWT

<NotV5/>

:::prerequisites
This page is part of the back end customization examples cookbook. Please ensure you've read its [introduction](/dev-docs/backend-customization/examples).
:::

**💭 Context:**

Out of the box, the front-end website of [FoodAdvisor](https://github.com/strapi/foodadvisor) does not provide any log in functionality. Logging in is done by accessing Strapi's admin panel at [`localhost:1337/admin`](http://localhost:1337/admin`).

<SideBySideContainer>

<SideBySideColumn>

Let's add a basic login page to the front-end, [Next.js](https://nextjs.org/)-powered website included in the `/client` folder of FoodAdvisor. The login page will be accessible at [`localhost:3000/auth/login`](http://localhost:3000/auth/login) and contain a typical email/password login form. This will allow programmatically authenticating API requests sent to Strapi.

</SideBySideColumn>

<SideBySideColumn>

<figure style={{ width: '100%', margin: '0' }}>
  <img src="/img/assets/backend-customization/tutorial-auth-flow.png" alt="Example login page" />
  <em><figcaption style={{ fontSize: '12px' }}>A possible example of a login form on the front-end website of FoodAdvisor</figcaption></em>
</figure>


</SideBySideColumn>
</SideBySideContainer>

<SideBySideContainer>
<SideBySideColumn>

**🎯 Goal**:

Create a front-end component to:

1. to display a login form,
2. send a request to the `/auth/local` route of the Strapi back-end server to authenticate,
3. get a [JSON Web Token](https://en.wikipedia.org/wiki/JSON_Web_Token) (JWT),
4. and store the JWT into the [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) property of your browser for later retrieval and authentication of our requests.

</SideBySideColumn>

<SideBySideColumn>

<SubtleCallout title="Related concept">

Additional information about JWT authentication can be found in the [Users & Permissions plugin](/dev-docs/plugins/users-permissions) documentation.

</SubtleCallout>

</SideBySideColumn>
</SideBySideContainer>

**🧑‍💻 Code example:**

To achieve this, in the `/client` folder of the [FoodAdvisor](https://github.com/strapi/foodadvisor) project, you could create a `pages/auth/login.js` file that contains the following example code.  Highlighted lines show the request sent to the `/auth/local` route provided by Strapi's Users & Permissions plugin:

This file uses the formik package - install it using `yarn add formik` and restart the dev server.

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
      /**
       * Gets the JWT from the server response
       */
      const { jwt } = await res.json();
      /**
       * Stores the JWT in the localStorage of the browser. 
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

<br />

:::strapi What's next?
Learn more about how custom [services and controllers](/dev-docs/backend-customization/examples/services-and-controllers) can help you tweak a Strapi-based application.
:::
