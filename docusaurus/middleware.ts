import { negotiateMarkdown } from "./edge/agent-negotiation.mjs";

/**
 * Serves Markdown to agents that ask for it with `Accept: text/markdown`.
 * Every other request goes on to the static site untouched.
 */
export default function middleware(request: Request) {
  return negotiateMarkdown(request);
}

/**
 * Pages only. Docusaurus serves its generated bundles from `/assets`, its
 * images from `/img` and `/diagrams`, and its custom scripts from `/js`;
 * a single page pulls dozens of them, and each match here is a billed
 * middleware invocation.
 */
export const config = {
  matcher: [
    "/((?!assets/|img/|js/|diagrams/|llms\\.txt|llms-full\\.txt|llms-code\\.txt|robots\\.txt|sitemap\\.xml|example-openapi-spec\\.json).*)",
  ],
};
