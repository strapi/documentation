---
title: Setting up the Preview feature
description: Learn to set up the Preview feature to link your front end application to Strapi's Content Manager Preview feature.
displayedSidebar: devDocsSidebar
tags:
- content manager
- preview
- configuration
---

# Setting up the Preview feature

Strapi's Preview feature enables previewing content directly from the admin panel. This feature allows content editors to preview their changes in a frontend application before publishing. 

This page describes how to set up the Preview feature in Strapi. Once set up, the feature can be used as described in the [User Guide](/user-docs/content-manager/previewing-content).

:::prerequisites
* The following environment variables must be defined in your `.env` file, replacing example values with appropriate values:

  ```env
  CLIENT_URL=https://your-frontend-app.com
  PREVIEW_SECRET=your-secret-key
  ```

* A front-end application for your Strapi project should be already created and set up, preferably using [Next.js](https://nextjs.org/) or [Nuxt](https://nuxt.com/).
:::

## Configuration components

The Preview feature configuration is stored in [the `config/admin` file](/dev-docs/configurations/admin-panel) and consists of 3 key components:

### Activation flag

Enables or disables the preview feature:
```javascript
preview: {
  enabled: true,
    // …
}
```

### Allowed origins

Controls which domains can access previews:

```javascript
preview: {
  config: {
    allowedOrigins: env("CLIENT_URL"),  // Usually your frontend application URL
    // …
  }
}
```

### Preview handler

Manages the preview logic and URL generation, as in the following example:

```javascript
preview: {
  config: {
    async handler(uid, { documentId, locale, status }) {
        // Fetches the document using the Document Service API
        const document = await strapi.documents(uid).findOne({ documentId });
        
        // Generates appropriate URL with a dedicated function to define
        const previewPathname = getPreviewPathname(uid, { locale, document });

        // Handles published content
        if (status === "published") {
            return `${clientUrl}${previewPathname}`;
        }

        // Handles drafts with security parameters
        const urlSearchParams = new URLSearchParams({
            url: previewPathname,
            secret: env('PREVIEW_SECRET'),
        });
        return `${clientUrl}/api/preview?${urlSearchParams}`;
}
```

The preview `handler` accepts the following parameters:

| Parameter    | Type   | Description                                 |
| ------------ | ------ | ------------------------------------------- |
| `uid`        | String | Content-type identifier (e.g., `api::article.article`)                    |
| `documentId` | String | Unique identifier of the document           |
| `locale`     | String | Locale of the content                |
| `status`     | String | Publication status (`published` or `draft`) |

An example of [URL generation logic](#2-add-url-generation-logic) in given in the following basic implementation guide.

## Basic implementation guide

Follow these steps to add Preview capabilities to your content types.

### 1. Create the Preview configuration

Create a new file `/config/admin.ts` (or update it if it exists) with the following basic structure:

```javascript title="config/admin.ts"
export default ({ env }) => ({
  // Other admin-related configurations go here
  // (see docs.strapi.io/dev-docs/configurations/admin-panel)
  preview: {
    enabled: true,
    config: {
      allowedOrigins: env('CLIENT_URL'),
      async handler (uid, { documentId, locale, status }) => {
        // Handler implementation coming in step 3
      },
    },
  },
});
```

### 2. Add URL generation logic

Add the URL generation logic with a `getPreviewPathname` function. The following example is taken from the [Launchpad](https://github.com/strapi/LaunchPad/tree/feat/preview) Strapi demo application:

```typescript
// Function to generate preview pathname based on content type and document
const getPreviewPathname = (uid, { locale, document }): string => {
  const { slug } = document;
  
  // Handle different content types with their specific URL patterns
  switch (uid) {
    // Handle pages with predefined routes
    case "api::page.page":
      switch (slug) {
        case "homepage":
          return `/${locale}`; // Localized homepage
        case "pricing":
          return "/pricing"; // Pricing page
        case "contact":
          return "/contact"; // Contact page
        case "faq":
          return "/faq"; // FAQ page
      }
    // Handle product pages
    case "api::product.product": {
      if (!slug) {
        return "/products"; // Products listing page
      }
      return `/products/${slug}`; // Individual product page
    }
    // Handle blog articles
    case "api::article.article": {
      if (!slug) {
        return "/blog"; // Blog listing page
      }
      return `/blog/${slug}`; // Individual article page
    }
  }
  return "/"; // Default fallback route
};
```

### 3. Add handler logic

Create the complete configuration, expanding the basic configuration created in step 1. with the URL generation logic created in step 2., adding an appropriate handler logic:

```typescript title="config/admin.ts" {8-9,18-35}
const getPreviewPathname = (uid, { locale, document }): string => {
  // … as defined in step 2
};

// Main configuration export
export default ({ env }) => {
  // Get environment variables
  const clientUrl = env("CLIENT_URL"); // Frontend application URL
  const previewSecret = env("PREVIEW_SECRET"); // Secret key for preview authentication

  return {
    // Other admin-related configurations go here
    // (see docs.strapi.io/dev-docs/configurations/admin-panel)
    preview: {
      enabled: true, // Enable preview functionality
      config: {
        allowedOrigins: clientUrl, // Restrict preview access to specific domain
        async handler(uid, { documentId, locale, status }) {
          // Fetch the complete document from Strapi
          const document = await strapi.documents(uid).findOne({ documentId });
          
          // Generate the preview pathname based on content type and document
          const previewPathname = getPreviewPathname(uid, { locale, document });

          // For published content, return direct URL
          if (status === "published") {
            return `${clientUrl}${previewPathname}`;
          }

          // For draft content, use Next.js draft mode
          const urlSearchParams = new URLSearchParams({
            url: previewPathname,
            secret: previewSecret, // Add security token
          });
          return `${clientUrl}/api/preview?${urlSearchParams}`;
        },
      },
    },
  };
};
```

### 4. Set up front-end preview route

For now, the Strapi Preview feature works best with [Next.js draft mode](https://nextjs.org/docs/app/building-your-application/configuring/draft-mode) or 
[Nuxt preview mode](https://nuxt.com/docs/api/composables/use-preview-mode). You will find additional documentation on how to implement the front-end part in their respective documentations.

If using Next.js, a basic implementation could be like in the following example taken from the [Launchpad](https://github.com/strapi/LaunchPad/tree/feat/preview) Strapi demo application:

```typescript title="/next/api/preview/route.ts"
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  // Parse query string parameters
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const url = searchParams.get("url");

  // Check the secret and next parameters
  // This secret should only be known to this route handler and the CMS
  if (secret !== process.env.PREVIEW_SECRET) {
    return new Response("Invalid token", { status: 401 });
  }

  // Enable Draft Mode by setting the cookie
  draftMode().enable();

  // Redirect to the path from the fetched post
  redirect(url || "/");
}

