---
title: v4 code migration - Policies - Strapi Developer Docs
description: Migrate policies from Strapi v3.6.8 to Strapi v4.0.x with step-by-step instructions
canonicalUrl:  Used by Google to index page, should start with https://docs.strapi.io/ — delete this comment when done [paste final URL here]
---

<!-- TODO: update SEO -->

# v4 code migration: Updating policies

!!!include(developer-docs/latest/update-migration-guides/migration-guides/v4/snippets/code-migration-intro.md)!!!

::: strapi v3/v4 comparison
In Strapi v3, policies are basically Koa middlewares handling authorization, accepting or rejecting requests based on the REST context. Policies can be applied directly on a REST controller’s action (then projected onto the associated GraphQL resolver) or directly on a custom GraphQL resolver.

<!-- Even when applied to a GraphQL resolver, V3 policies were Koa middleware which was given a handmade Koa context (built from the GraphQL resolver args) -->

In Strapi v4, [policies](/developer-docs/latest/development/backend-customization/policies.md#policies) are functions that should return `true` or `undefined` for the request to be authorized. Any other response means the policy will fail. v4 policies are given a custom context based on where the policy has been called from (e.g. a REST controller’s action, a GraphQL resolver, etc.). A policy can be applied either to a GraphQL resolver or to a REST controller.
:::
<!-- 
Global policies are declared in the `src/policies` folder
API related policies are declared in the `src/api/**/policies` folder

- Common policy
    
    **Only accept connected user**
    
    V3
    
    ```jsx
    module.exports = async (ctx, next) => {
      if (ctx.state.user) {
        // Go to next policy or will reach the controller's action.
        return await next();
      }
    
      ctx.unauthorized(`You're not logged in!`);
    };
    ```
    
    V4
    
    Note: This one is a policy that can be used both in REST & GraphQL since it makes use of the `context.state` variable (which is declared whether we’re using REST or GraphQL). Thus you can use it wherever you want.
    
    ```jsx
    // path: ./src/api/api-name/policies/policy-name.js
    
    module.exports = (context, config, { strapi }) => {
      if (context.state.user) { // if a session is open
        // go to next policy or reach the controller's action
        return true;
      }
    
      return false; // If you return nothing, Strapi considers you didn't want to block the request and will let it pass
    };
    ```
    

- REST policy
    
    **Goal:** Authorize only GET requests
    
    ```jsx
    module.exports = (context, config, { strapi }) => {
    	// Here we're accessing the request.method property present in the Koa context 
    	return context.request.method === 'GET';
    };
    ```
    

- GraphQL policy
    
    **Goal:** Authorize field resolvers only for a specific entity
    
    ```jsx
    module.exports = (context, config, { strapi }) => {
    	return typeof context.parent === 'object' && context.parent.id === 5;
    };
    ```
    
- REST + GraphQL policy
    
    **Goal:** Make sure an `id` filter has been provided
    
    ```jsx
    module.exports = (context, config, { strapi }) => {
    	// Handle Koa
    	if (context.is('koa')) {
    		return context.request.query.id !== undefined;
    	}
    
    	// Handle GraphQL
    	else if (context.is('graphql')) {
    		return context.args.id !== undefined;
    	}
    
    	// Other scenarios
    	return false;
    };
    ```
    
    Explanations: Here we’re using the `is` method of the policy context to check if the policy is being tested for a Koa controller or a GraphQL resolver and act accordingly.
    
    Note: For GraphQL context, you’ve access to `parent`, `args`, `context`, `info` & `http` (which contains the koa context). Whereas for Koa, the controller context will be merged with the policy context.
    
    Finally, both Koa & GraphQL context will get access to the `is(type: string): boolean`, `type: string`, and `state: object` attributes. -->
