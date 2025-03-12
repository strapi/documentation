---
sidebar_label: 'Caching for app performance'
displayed_sidebar: cloudSidebar
sidebar_position: 4
tags:
- caching
- Content Delivery Network (CDN)
- Strapi Cloud
---

# Caching & Performance

For Strapi Cloud applications with large amounts of cacheable content, such as images, videos, and other static assets, enabling CDN (Content Delivery Network) caching via the <ExternalLink to="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control" text="`Cache-control` header"/> can help improve application performance.

CDN caching can help improve application performance in a few ways:

* **Reducing Latency**: Caching frequently accessed content on edge servers located closer to the end-users can reduce the time it takes to load content.
* **Offloading Origin Server**: By caching content on edge servers it can offload the origin server, reducing the load and allowing it to focus on delivering more dynamic content.
* **Handling Traffic Spikes**: Help handle traffic spikes by distributing the load across multiple edge servers. This can prevent the origin server from becoming overwhelmed during peak traffic times and ensures a consistent user experience.

## Cache-Control Header in Strapi Cloud

Static sites deployed on Strapi Cloud include, by default, a `Cache-Control` header set to cache for 24 hours on CDN edge servers and 10 seconds in web browsers. This is done to ensure that the latest version of the site is always served to users.

Responses from dynamic apps served by Strapi Cloud are not cached by default. To enable caching, you must set the `Cache-Control` header in the app’s `HTTP` response functions.

<Tabs groupId="js-ts">
<TabItem value="js" label="JavaScript">

```js
function myHandler(req, res) {
  // Set the Cache-Control header to cache responses for 1 day
  res.setHeader('Cache-Control', 'max-age=86400');
  
  // Add your logic to generate the response here
}
```
</TabItem>

<TabItem value="ts" label="TypeScript">

```ts
import { Request, Response } from 'express';

function myHandler(req: Request, res: Response) {
  // Set the Cache-Control header to cache responses for 1 day
  res.setHeader('Cache-Control', 'max-age=86400');
  
  // Add your logic to generate the response here
}
```
</TabItem>
</Tabs>
