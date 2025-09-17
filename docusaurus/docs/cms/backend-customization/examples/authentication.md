---
title: Authentication flow with JWT
description: Learn how to authenticate REST API queries using our FoodAdvisor example
displayed_sidebar: cmsSidebar
pagination_prev: cms/backend-customization/examples
pagination_next: cms/backend-customization/examples/services-and-controllers
---

import NotV5 from '/docs/snippets/_not-updated-to-v5.md'

# Examples cookbook: Authentication flow with JWT

<NotV5/>

:::prerequisites
This page is part of the back end customization examples cookbook. Please ensure you've read its [introduction](/cms/backend-customization/examples).
:::

**💭 Context:**

Out of the box, the front-end website of <ExternalLink to="https://github.com/strapi/foodadvisor" text="FoodAdvisor"/> does not provide any log in functionality. Logging in is done by accessing Strapi's admin panel at <ExternalLink to="http://localhost:1337/admin`" text="`localhost:1337/admin`"/>.

<SideBySideContainer>

<SideBySideColumn>

Let's add a basic login page to the front-end, <ExternalLink to="https://nextjs.org/" text="Next.js"/>-powered website included in the `/client` folder of FoodAdvisor. The login page will be accessible at <ExternalLink to="http://localhost:3000/auth/login" text="`localhost:3000/auth/login`"/> and contain a typical email/password login form. This will allow programmatically authenticating API requests sent to Strapi.

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
3. get a <ExternalLink to="https://en.wikipedia.org/wiki/JSON_Web_Token" text="JSON Web Token"/> (JWT),
4. and store the JWT into the <ExternalLink to="https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage" text="`localStorage`"/> property of your browser for later retrieval and authentication of our requests.

</SideBySideColumn>

<SideBySideColumn>

<SubtleCallout title="Related concept">

Additional information about JWT authentication can be found in the [Users & Permissions plugin](/cms/features/users-permissions) documentation.

</SubtleCallout>

</SideBySideColumn>
</SideBySideContainer>

**🧑‍💻 Code example:**

To achieve this, in the `/client` folder of the <ExternalLink to="https://github.com/strapi/foodadvisor" text="FoodAdvisor"/> project, you could create a `pages/auth/login.js` file that contains the following example code.  Highlighted lines show the request sent to the `/auth/local` route provided by Strapi's Users & Permissions plugin:

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

## Enhanced Authentication with Session Management

The above example uses the traditional JWT approach. For enhanced security, you can enable session management mode in your Users & Permissions configuration, which provides shorter-lived access tokens and refresh token functionality.

### Configuration

First, enable session management in your `/config/plugins.js`:

```js title="/config/plugins.js"
module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      jwtManagement: 'refresh',
      sessions: {
        accessTokenLifespan: 604800, // 1 week (default)
        maxRefreshTokenLifespan: 2592000, // 30 days
        idleRefreshTokenLifespan: 604800, // 7 days
      },
    },
  },
});
```

### Enhanced Login Component

Here's an updated login component that handles both JWT and refresh tokens:

```jsx title="/client/pages/auth/enhanced-login.js"
import React, { useState } from 'react';
import { useFormik } from 'formik';
import { Button, Input } from '@nextui-org/react';
import Layout from '@/components/layout';
import { getStrapiURL } from '@/utils';

const EnhancedLogin = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { handleSubmit, handleChange } = useFormik({
    initialValues: {
      identifier: '',
      password: '',
    },
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const res = await fetch(getStrapiURL('/auth/local'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        const data = await res.json();

        if (res.ok) {
          // Store both tokens (session management mode)
          if (data.refreshToken) {
            localStorage.setItem('accessToken', data.jwt);
            localStorage.setItem('refreshToken', data.refreshToken);
          } else {
            // Legacy mode - single JWT
            localStorage.setItem('token', data.jwt);
          }

          // Redirect to protected area
          window.location.href = '/dashboard';
        } else {
          console.error('Login failed:', data.error);
        }
      } catch (error) {
        console.error('Login error:', error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <Layout>
      <div className="h-full w-full flex justify-center items-center my-24">
        <form onSubmit={handleSubmit} className="flex flex-col gap-y-6 w-4/12">
          <h1 className="font-bold text-3xl mb-6">Enhanced Login</h1>
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
          <Button
            type="submit"
            className="bg-primary rounded-md text-muted"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default EnhancedLogin;
```
```

<br />

:::strapi What's next?
Learn more about how custom [services and controllers](/cms/backend-customization/examples/services-and-controllers) can help you tweak a Strapi-based application.
:::
