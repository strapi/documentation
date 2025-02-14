---
title: Preview
description: With the Preview feature, you can preview your front-end directly from the Content Manager
displayedSidebar: userSidebar
toc_max_heading_level: 4
tags:
- content manager
- preview
- features
---

# Preview

With the Preview feature, you can preview your front end application directly from Strapi's admin panel. This is helpful to see how updates to your content in the Edit View of the Content Manager will affect the final result.

:::prerequisites Identity Card of the Feature
<Icon name="credit-card"/> **Plan:** Free feature.<br/>
<Icon name="user"/> **Role & permission:** Read permissions in Roles > Plugins - Users & Permissions. <br/>
<Icon name="toggle-left"/> **Activation:** Should be configured in the `config/admin` file. <br/>
<Icon name="laptop"/> **Environment:** Available in both Development & Production environment.
:::

<!-- TODO: add a dark mode screenshot -->
<ThemedImage
  alt="Previewing content"
  sources={{
    light: '/img/assets/content-manager/previewing-content.png',
    dark: '/img/assets/content-manager/previewing-content.png',
  }}
/>

<!-- <div style={{position: 'relative', paddingBottom: 'calc(54.43121693121693% + 50px)', height: '0'}}>
<iframe id="zpen5g4t8p" src="https://app.guideflow.com/embed/zpen5g4t8p" width="100%" height="100%" style={{overflow:'hidden', position:'absolute', border:'none'}} scrolling="no" allow="clipboard-read; clipboard-write" webkitallowfullscreen mozallowfullscreen allowfullscreen allowtransparency="true"></iframe>
</div> -->

## Configuration

:::note Notes
* The following environment variables must be defined in your `.env` file, replacing example values with appropriate values:

  ```bash
  CLIENT_URL=https://your-frontend-app.com
  PREVIEW_SECRET=your-secret-key # optional, required with Next.js draft mode
  ```

* A front-end application for your Strapi project should be already created and set up.
:::

### Configuration components

The Preview feature configuration is stored in the `preview` object of [the `config/admin` file](/cms/configurations/admin-panel) and consists of 3 key components:

#### Activation flag

Enables or disables the preview feature:
```javascript title="config/admin.ts|js" {3}
// …
preview: {
  enabled: true,
    // …
}
// …
```

#### Allowed origins

Controls which domains can access previews:

```javascript title="config/admin.ts|js" {5}
// …
preview: {
  enabled: true,
  config: {
    allowedOrigins: env("CLIENT_URL"),  // Usually your frontend application URL
    // …
  }
}
// …
```

#### Preview handler

Manages the preview logic and URL generation, as in the following basic example where `uid` is the content-type identifier (e.g., `api::article.article` or `plugin::my-api.my-content-type`):

```jsx title="config/admin.ts|js" {6-11}
// …
preview: {
  enabled: true,
  config: {
    // …
    async handler(uid, { documentId, locale, status }) {
      const document = await strapi.documents(uid).findOne({ documentId });
      const pathname = getPreviewPathname(uid, { locale, document });

      return `${env('PREVIEW_URL')}${pathname}`
    },
  }
}
// …
```

An example of [URL generation logic](#2-add-url-generation-logic) in given in the following basic implementation guide.

##### Previewing draft entries

The strategy for the front end application to query draft or published content is framework-specific. At least 3 strategies exist:

- using a query parameter, having something like `/your-path?preview=true` (this is, for instance, how [Nuxt](https://nuxt.com/docs/api/composables/use-preview-modehow) works)
- redirecting to a dedicated preview route like `/preview?path=your-path`(this is, for instance, how [Next's draft mode](https://nextjs.org/docs/app/building-your-application/configuring/draft-mode) works)
- or using a different domain for previews like `preview.mysite.com/your-path`.

When [Draft & Publish](/cms/features/draft-and-publish) is enabled for your content-type, you can also directly leverage Strapi's `status` parameter to handle the logic within the Preview handler, using the following generic approach:

```javascript
async handler(uid, { documentId, locale, status }) {
   const document = await strapi.documents(uid).findOne({ documentId });
   const pathname = getPreviewPathname(uid, { locale, document });
   if (status === 'published')  { 
      // return the published version
   }
   // return the draft version
},
```

A more detailed example using the draft mode of Next.js is given in the [basic implementation guide](#3-add-handler-logic).

### Basic implementation guide

Follow these steps to add Preview capabilities to your content types.

#### 1. Create the Preview configuration

Create a new file `/config/admin.ts` (or update it if it exists) with the following basic structure:

```javascript title="config/admin.ts"
export default ({ env }) => ({
  // Other admin-related configurations go here
  // (see docs.strapi.io/cms/configurations/admin-panel)
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

#### 2. Add URL generation logic

Add the URL generation logic with a `getPreviewPathname` function. The following example is taken from the [Launchpad](https://github.com/strapi/LaunchPad/tree/feat/preview) Strapi demo application:

```typescript title="config/admin.ts"
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
    default: {
      return null;
    }
  }
};

// … main export (see step 3)
```

:::note
Some content types don't need to have a preview if it doesn't make sense, hence the default case returning `null`. A Global single type with some site metadata, for example, will not have a matching front-end page. In these cases, the handler function should return `null`, and the preview UI will not be shown in the admin panel. This is how you enable or disable preview per content type.
:::

#### 3. Add handler logic

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
    // (see docs.strapi.io/cms/configurations/admin-panel)
    preview: {
      enabled: true, // Enable preview functionality
      config: {
        allowedOrigins: clientUrl, // Restrict preview access to specific domain
        async handler(uid, { documentId, locale, status }) {
          // Fetch the complete document from Strapi
          const document = await strapi.documents(uid).findOne({ documentId });
          
          // Generate the preview pathname based on content type and document
          const pathname = getPreviewPathname(uid, { locale, document });

          // Disable preview if the pathname is not found
          if (!pathname) {
            return null;
          }

          // Use Next.js draft mode passing it a secret key and the content-type status
          const urlSearchParams = new URLSearchParams({
            url: pathname,
            secret: previewSecret,
            status,
          });
          return `${clientUrl}/api/preview?${urlSearchParams}`;
        },
      },
    },
  };
};

```
#### 4. Set up the front-end preview route

Setting up the front-end preview route is highly dependent on the framework used for your front-end application.

For instance, [Next.js draft mode](https://nextjs.org/docs/app/building-your-application/configuring/draft-mode) and
[Nuxt preview mode](https://nuxt.com/docs/api/composables/use-preview-mode) provide additional documentation on how to implement the front-end part in their respective documentations.

If using Next.js, a basic implementation could be like in the following example taken from the [Launchpad](https://github.com/strapi/LaunchPad/tree/feat/preview) Strapi demo application:

```typescript title="/next/api/preview/route.ts"
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  // Parse query string parameters
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const url = searchParams.get("url");
  const status = searchParams.get("status");

  // Check the secret and next parameters
  // This secret should only be known to this route handler and the CMS
  if (secret !== process.env.PREVIEW_SECRET) {
    return new Response("Invalid token", { status: 401 });
  }

  // Enable Draft Mode by setting the cookie
  if (status === "published") {
    draftMode().disable();
  } else {
    draftMode().enable();
  }

  // Redirect to the path from the fetched post
  // We don't redirect to searchParams.slug as that might lead to open redirect vulnerabilities
  redirect(url || "/");
}
```

#### 5. Allow the front-end to be embedded

On the Strapi side, [the `allowedOrigins` configuration parameter](#allowed-origins) allows the admin panel to load the front-end window in an iframe. But allowing the embedding works both ways, so on the front-end side, you also need to allow the window to be embedded in Strapi's admin panel.

This requires the front-end application to have its own header directive, the CSP `frame-ancestors` directive. Setting this directive up depends on how your website is built. For instance, setting this up in Next.js requires a middleware configuration (see [Next.js docs](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)).

## Usage

**Path to use the feature:** <Icon name="feather" /> Content Manager, edit view of your content type

Once the Preview feature is properly set up, an **Open preview** button is visible on the right side of the [Content Manager's edit view](/cms/features/content-manager#overview). Clicking it will display the preview of your content as it will appear in your front-end application, but directly within Strapi's the admin panel.

<!-- TODO: add a dark mode GIF -->
<ThemedImage
  alt="Previewing content"
  sources={{
    light: '/img/assets/content-manager/previewing-content.gif',
    dark: '/img/assets/content-manager/previewing-content.gif',
  }}
/>

From the Preview screen, you can:

- click the close button ![Close button](/img/assets/icons/close-icon.svg) in the upper left corner to go back to the Edit View of the Content Manager,
- switch between previewing the draft and the published version (if [Draft & Publish](/cms/features/draft-and-publish) is enabled for the content-type),
- and click the link icon ![Link icon](/img/assets/icons/v5/Link.svg) in the upper right corner to copy the preview link. Depending on the preview tab you are currently viewing, this will either copy the link to the preview of the draft or the published version.

:::caution
When making updates to the content, first save them before clicking on Open Preview again, otherwise your latest updates will be lost. A pop up window will warn you about this behavior.
:::
