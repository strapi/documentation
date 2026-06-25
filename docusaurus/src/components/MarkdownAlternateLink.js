import React from 'react';
import Head from '@docusaurus/Head';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

/**
 * Emits <link rel="alternate" type="text/markdown" href="<page>.md"> in the
 * page <head>. A standard machine-readable signal pointing agents/crawlers to
 * the clean Markdown twin of the page (generated at build time, see
 * generate-llms.js writePerPageMarkdown). Rendered once per doc (on the H1).
 */
export default function MarkdownAlternateLink() {
  const { pathname } = useLocation();
  const { siteConfig } = useDocusaurusContext();

  const clean = (pathname || '').replace(/\/$/, '');
  if (!clean || clean === '') return null; // homepage: HTML only

  const origin = (siteConfig.url || '').replace(/\/$/, '');
  const href = `${origin}${clean}.md`;

  return (
    <Head>
      <link rel="alternate" type="text/markdown" href={href} />
    </Head>
  );
}
