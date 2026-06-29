/**
 * Swizzled DocItem/Content.
 *
 * Based on the original Docusaurus DocItemContent. When a page has no markdown
 * H1 (its title comes from front matter), Docusaurus renders a "synthetic" H1
 * here via @theme/Heading — which bypasses our @theme/MDXComponents/Heading
 * swizzle, so the AiToolbar (mounted on the markdown H1) never appeared on
 * those pages. We mount the same affordances after the synthetic H1 so every
 * page gets the toolbar. Pages WITH a markdown H1 have syntheticTitle === null
 * here, so they keep getting the toolbar from MDXComponents/Heading — no
 * duplication.
 */
import React from 'react';
import clsx from 'clsx';
import { ThemeClassNames } from '@docusaurus/theme-common';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import Heading from '@theme/Heading';
import MDXContent from '@theme/MDXContent';
import { AiToolbar } from '../../../components/AiToolbar';
import MarkdownAlternateLink from '../../../components/MarkdownAlternateLink';

function useSyntheticTitle() {
  const { metadata, frontMatter, contentTitle } = useDoc();
  const shouldRender =
    !frontMatter.hide_title && typeof contentTitle === 'undefined';
  if (!shouldRender) {
    return null;
  }
  return metadata.title;
}

export default function DocItemContent({ children }) {
  const syntheticTitle = useSyntheticTitle();
  return (
    <div className={clsx(ThemeClassNames.docs.docMarkdown, 'markdown')}>
      {syntheticTitle && (
        <>
          <header>
            <Heading as="h1">{syntheticTitle}</Heading>
          </header>
          {/* The synthetic H1 bypasses MDXComponents/Heading, so mount the
              toolbar affordances here for front-matter-only titled pages. */}
          <AiToolbar />
          <MarkdownAlternateLink />
        </>
      )}
      <MDXContent>{children}</MDXContent>
    </div>
  );
}
