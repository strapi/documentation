:::note Two APIs, two sides of a plugin
A Strapi plugin can interact with both sides of a Strapi application:

- The **Server API** handles the back-end part: lifecycle hooks, routes, controllers, services, policies, middlewares, and configuration.
- The **Admin Panel API** handles the front-end part: injecting React components, menu links, settings, reducers, and translations into the admin panel.

Most plugins use both. This page covers one side — refer to the links below for the other.

| | Server API | Admin Panel API |
| --- | --- | --- |
| **Entry file** | `server/src/index.js\|ts` | `admin/src/index.js\|ts` |
| **Runs in** | Node.js (server) | Browser (React app) |
| **Main purpose** | Expose endpoints, run lifecycle logic, manage data | Customize the admin panel UI |
| **Go to** | [Server API](/cms/plugins-development/server-api) | [Admin Panel API](/cms/plugins-development/admin-panel-api) |
:::