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

<Tldr>
Preview connects the Content Manager to the front end so editors can see changes before publishing. In this documentation: configuration steps to set preview URLs.
</Tldr>

With the Preview feature, you can preview your front end application directly from Strapi's admin panel. This is helpful to see how updates to your content in the Edit View of the Content Manager will affect the final result.

<IdentityCard>
  <IdentityCardItem icon="credit-card" title="Plan">Free feature<br/>Live Preview available only with the CMS Growth and Enterprise plans.</IdentityCardItem>
  <IdentityCardItem icon="user" title="Role & permission">Read permissions in Roles > Plugins - Users & Permissions</IdentityCardItem>
  <IdentityCardItem icon="toggle-right" title="Activation">Should be configured in the `config/admin` file</IdentityCardItem>
  <IdentityCardItem icon="desktop" title="Environment">Available in both Development & Production environment</IdentityCardItem>
</IdentityCard>

<!-- TODO: add a dark mode screenshot -->
<ThemedImage
  alt="Previewing content"
  sources={{
    light: '/img/assets/content-manager/previewing-content-desktop-mobile.gif',
    dark: '/img/assets/content-manager/previewing-content-desktop-mobile.gif',
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
  PREVIEW_SECRET=your-secret-key
  ```

  The `PREVIEW_SECRET` key is optional but required with Next.js draft mode.

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

An example of [URL generation logic](#2-add-url-generation) in given in the following basic implementation guide.

##### Previewing draft entries

The strategy for the front end application to query draft or published content is framework-specific. At least 3 strategies exist:

- using a query parameter, having something like `/your-path?preview=true` (this is, for instance, how <ExternalLink to="https://nuxt.com/docs/api/composables/use-preview-mode" text="Nuxt"/> works)
- redirecting to a dedicated preview route like `/preview?path=your-path`(this is, for instance, how <ExternalLink to="https://nextjs.org/docs/app/building-your-application/configuring/draft-mode" text="Next's draft mode"/> works)
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

A more detailed example using the draft mode of Next.js is given in the [basic implementation guide](#3-add-handler).

### Basic implementation guide

Follow these steps to add Preview capabilities to your content types.

#### 1. [Strapi] Create the Preview configuration {#1-create-config}

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

#### 2. [Strapi] Add URL generation logic {#2-add-url-generation}

Add the URL generation logic with a `getPreviewPathname` function. The following example is taken from the <ExternalLink to="https://github.com/strapi/LaunchPad/tree/feat/preview" text="Launchpad"/> Strapi demo application:

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

#### 3. [Strapi] Add handler logic {#3-add-handler}

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
#### 4. [Front end] Set up the front-end preview route {#4-setup-frontend-route}

Setting up the front-end preview route is highly dependent on the framework used for your front-end application.

For instance, <ExternalLink to="https://nextjs.org/docs/app/building-your-application/configuring/draft-mode" text="Next.js draft mode"/> and
<ExternalLink to="https://nuxt.com/docs/api/composables/use-preview-mode" text="Nuxt preview mode"/> provide additional documentation on how to implement the front-end part in their respective documentations.

If using Next.js, a basic implementation could be like in the following example taken from the <ExternalLink to="https://github.com/strapi/LaunchPad/tree/feat/preview" text="Launchpad"/> Strapi demo application:

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

#### 5. [Front end] Allow the front-end to be embedded {#5-allow-frontend-embed}

On the Strapi side, [the `allowedOrigins` configuration parameter](#allowed-origins) allows the admin panel to load the front-end window in an iframe. But allowing the embedding works both ways, so on the front-end side, you also need to allow the window to be embedded in Strapi's admin panel.

This requires the front-end application to have its own header directive, the CSP `frame-ancestors` directive. Setting this directive up depends on how your website is built. For instance, setting this up in Next.js requires a middleware configuration (see [Next.js docs](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)).

#### 6. [Front end] Adapt data fetching for draft content {#6-fetch-draft-content}

Once the preview system is set up, you need to adapt your data fetching logic to handle draft content appropriately. This involves the following steps:

1. Create or adapt your data fetching utility to check if draft mode is enabled
2. Update your API calls to include the draft status parameter when appropriate

The following, taken from the <ExternalLink to="https://github.com/strapi/LaunchPad/tree/feat/preview" text="Launchpad" /> Strapi demo application, is an example of how to implement draft-aware data fetching in your Next.js front-end application:

```typescript {8-18}
import { draftMode } from "next/headers";
import qs from "qs";

export default async function fetchContentType(
  contentType: string,
  params: Record = {}
): Promise {
  // Check if Next.js draft mode is enabled
  const { isEnabled: isDraftMode } = await draftMode();
  
  try {
    const queryParams = { ...params };
    // Add status=draft parameter when draft mode is enabled
    if (isDraftMode) {
      queryParams.status = "draft";
    }
    
    const url = `${baseURL}/${contentType}?${qs.stringify(queryParams)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch data from Strapi (url=${url}, status=${response.status})`
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching content:", error);
    throw error;
  }
}
```

This utility method can then be used in your page components to fetch either draft or published content based on the preview state:

```typescript
// In your page component:
const pageData = await fetchContentType('api::page.page', {
  // Your other query parameters
});
```

### Live Preview implementation <GrowthBadge/> <EnterpriseBadge />

After setting up the basic Preview feature, you can enhance the experience by implementing Live Preview.

#### Window messages

Live Preview creates a more interactive experience by communicating between the admin and your frontend. It relies on events posted through [the `postMessage()` API](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) on the `window` object.

You need to add an event listener in your application. It should be present on all pages, ideally in a layout component that wraps your entire application. The listener needs to filter through messages and react only to Strapi-initiated messages.

There are 2 messages to listen to:

- `strapiUpdate`: sent by Strapi when a content update has been saved to the database. It's an opportunity to fetch the updated version of the content and refresh the preview. With Next.js, the recommended way to refresh the iframe content is with <ExternalLink to="https://nextjs.org/docs/app/building-your-application/caching#routerrefresh" text="the `router.refresh()` method" />.
- `previewScript`: sent by Strapi to give you a script that powers the Live Preview functionality. This script should be injected into the page's `<head>` tag. It handles highlighting editable areas in the preview and sending messages back to Strapi when an area is double-clicked for editing.

In order to receive the `previewScript` message, you need to let Strapi know that your frontend is ready to receive it. This is done by posting a `previewReady` message to the parent window.

When putting it all together, a component ready to be added to your global layout could look like:


<Tabs groupId="js-ts">
<TabItem label="JavaScript" value="js">

```jsx title="next/app/path/to/your/front/end/logic.jsx"
'use client';

export default function LivePreview() {
  // …
  const router = useRouter();

  useEffect(() => {
    const handleMessage = async (message) => {
      const { origin, data } = message;

      if (origin !== process.env.NEXT_PUBLIC_API_URL) {
        return;
      }

      if (data.type === 'strapiUpdate') {
        router.refresh();
      } else if (data.type === 'strapiScript') {
        const script = window.document.createElement('script');
        script.textContent = data.payload.script;
        window.document.head.appendChild(script);
      }
    };

    // Add the event listener
    window.addEventListener('message', handleMessage);

    // Let Strapi know we're ready to receive the script
    window.parent?.postMessage({ type: 'previewReady' }, '*');

    // Remove the event listener on unmount
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [router]);

  return null;
}
```
</TabItem>

<TabItem label="TypeScript" value="ts">

```tsx title="next/app/path/to/your/front/end/logic.tsx"
'use client';

export default function LivePreview() {
  // …
  const router = useRouter();

  useEffect(() => {
    const handleMessage = async (message: MessageEvent<any>) => {
      const { origin, data } = message;

      if (origin !== process.env.NEXT_PUBLIC_API_URL) {
        return;
      }

      if (data.type === 'strapiUpdate') {
        router.refresh();
      } else if (data.type === 'strapiScript') {
        const script = window.document.createElement('script');
        script.textContent = data.payload.script;
        window.document.head.appendChild(script);
      }
    };

    // Add the event listener
    window.addEventListener('message', handleMessage);

    // Let Strapi know we're ready to receive the script
    window.parent?.postMessage({ type: 'previewReady' }, '*');

    // Remove the event listener on unmount
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [router]);

  return null;
}
```

</TabItem>
</Tabs>

<details>
<summary>Caching in Next.js:</summary>

In Next.js, [cache persistence](https://nextjs.org/docs/app/building-your-application/caching) may require additional steps. You might need to invalidate the cache by making an API call from the client side to the server, where the revalidation logic will be handled. Please refer to Next.js documentation for details, for instance with the [revalidatePath() method](https://nextjs.org/docs/app/building-your-application/caching#revalidatepath).
<br/>

</details>

#### Content source maps

Live Preview is able to identify the parts of your frontend that correspond to fields in Strapi. This is done through content source maps, which are metadata encoded as hidden characters in your string-based content (e.g., text fields). It uses the <ExternalLink to="https://www.npmjs.com/package/@vercel/stega" text="@vercel/stega"/> library to encode and decode this metadata.

Metadatas will only be added in your Content API responses when the `strapi-encode-source-maps` header is set to `true`. You can set this header in your data fetching utility. Make sure to only pass the header when you detect that your site is rendered in a preview context.

For a Next.js application, you may use the `draftMode()` method from `next/headers` to detect if draft mode is enabled, and set the header accordingly in all your API calls:

```typescript {20-23}
import { draftMode } from "next/headers";
import qs from "qs";

export default async function fetchContentType(
  contentType: string,
  params: Record = {}
): Promise {
  // Check if Next.js draft mode is enabled
  const { isEnabled: isDraftMode } = await draftMode();
  
  try {
    const queryParams = { ...params };
    // Add status=draft parameter when draft mode is enabled
    if (isDraftMode) {
      queryParams.status = "draft";
    }
    
    const url = `${baseURL}/${contentType}?${qs.stringify(queryParams)}`;
    const response = await fetch(url, {
      headers: {
        // Enable content source maps in preview mode
        "strapi-encode-source-maps": isDraftMode ? "true" : "false",
      },
    });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch data from Strapi (url=${url}, status=${response.status})`
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching content:", error);
    throw error;
  }
}
```

## Usage

**Path to use the feature:** <Icon name="feather" /> Content Manager, edit view of your content type

:::strapi Preview vs. Live Preview
Based on your CMS plan, your experience with Preview will be different:
- With the Free plan, Preview will be full screen only.
- With the <GrowthBadge /> and <EnterpriseBadge /> plans, you get access to an enhanced experience called Live Preview. With Live Preview, you can see the Preview alongside the Edit view of the Content Manager, and you can also edit the content directly within the preview itself by double-clicking on any content.
:::

Once the Preview feature is properly set up, an **Open preview** button is visible on the right side of the [Content Manager's edit view](/cms/features/content-manager#overview). Clicking it will display the preview of your content as it will appear in your front-end application, but directly within Strapi's the admin panel.

<!-- TODO: add a dark mode GIF -->
<ThemedImage
  alt="Previewing content"
  sources={{
    light: '/img/assets/content-manager/previewing-content3.gif',
    dark: '/img/assets/content-manager/previewing-content3.gif',
  }}
/>

Once the Preview is open, you can:

- click the close button <Icon name="x" classes="ph-bold" /> in the upper left corner to go back to the Edit View of the Content Manager,
- switch between the Desktop and Mobile preview using the dropdown above the previewed content,
- switch between previewing the draft and the published version (if [Draft & Publish](/cms/features/draft-and-publish) is enabled for the content-type),
- and click the link icon <Icon name="link" classes="ph-bold"/> in the upper right corner to copy the preview link. Depending on the preview tab you are currently viewing, this will either copy the link to the preview of the draft or the published version.

:::note
In the Edit view of the Content Manager, the Open preview button will be disabled if you have unsaved changes. Save your latest changes and you should be able to preview content again.
:::

### Live Preview
<GrowthBadge /> <EnterpriseBadge />

Live Preview is the enhanced Preview experience available with Strapi’s paid CMS plans.

With Live Preview, in addition to what’s included in the Free plan, you can:

* Use the Side Editor to view both the entry’s Edit view in the Content Manager and the front-end preview side by side. You can also switch between full-screen and side-by-side preview using the <Icon name="arrow-line-left" classes="ph-bold" /> and <Icon name="arrow-line-right" classes="ph-bold" /> buttons.
* Double-click any content in the preview pane to edit it in place. This opens a popover that syncs the front-end content with the corresponding field in Strapi.

<!-- TODO: add dark mode GIF -->
<ThemedImage
  alt="Previewing content"
  sources={{
    light: '/img/assets/content-manager/previewing-content-live.gif',
    dark: '/img/assets/content-manager/previewing-content-live.gif',
  }}
/>

:::caution Experimental feature
This feature is currently experimental. Feel free to share <ExternalLink to="https://feedback.strapi.io/" text="feedback"/> or <ExternalLink to="https://github.com/strapi/strapi/issues" text="issues" /> with the Strapi team.

The current version of Live Preview comes with the following limitations:
* Blocks fields are not detected, and changing them in the Side Editor won’t be reflected in the preview. Clicking on Save after updates should however still work.
* Media assets and fields in dynamic zones are not handled.
:::
