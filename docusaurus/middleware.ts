import senthor from "@senthor-io/vercel";

/**
 * Headers forwarded to the Senthor API.
 *
 * The package ships a deny list: it strips `authorization`, `cookie`,
 * `set-cookie` and `x-csrf-token`, then sends every other header of the
 * incoming request to waf-api.senthor.io. Inverting it into an allow list
 * keeps the infrastructure headers added by CloudFront and Vercel on our
 * edge, including the `cloudfront-viewer-*` geolocation ones, and bounds
 * what leaves the request to the signals a bot detector actually reads.
 */
const FORWARDED_HEADERS = [
  "host",
  "user-agent",
  "from",
  "referer",
  "accept",
  "accept-language",
  "accept-encoding",
  "sec-ch-ua",
  "sec-ch-ua-mobile",
  "sec-ch-ua-platform",
  "sec-fetch-dest",
  "sec-fetch-mode",
  "sec-fetch-site",
  "sec-fetch-user",
  "x-forwarded-for",
  "x-real-ip",
];

export default function middleware(request: Request) {
  const headers = new Headers();

  for (const name of FORWARDED_HEADERS) {
    const value = request.headers.get(name);
    if (value !== null) {
      headers.set(name, value);
    }
  }

  return senthor(new Request(request, { headers }));
}

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
