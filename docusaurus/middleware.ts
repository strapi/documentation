import senthor from "@senthor-io/vercel";

export default senthor;

/**
 * Pages only. Docusaurus serves its generated bundles from `/assets`, its
 * images from `/img` and `/diagrams`, and its custom scripts from `/js`;
 * a single page pulls dozens of them, and each match here is a billed
 * middleware invocation plus a round trip to the Senthor API.
 */
export const config = {
  matcher: [
    "/((?!assets/|img/|js/|diagrams/|llms\\.txt|llms-full\\.txt|llms-code\\.txt|robots\\.txt|sitemap\\.xml|example-openapi-spec\\.json).*)",
  ],
};
