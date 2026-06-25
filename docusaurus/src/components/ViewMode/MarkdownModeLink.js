import React, { useEffect, useState } from 'react';
import { getCleanMarkdownUrl } from '../AiToolbar/utils/docContext';
import styles from './markdownModeLink.module.scss';

/**
 * Discreet "View this page as .md" link shown ONLY in markdown view mode.
 * The global "View as Markdown" button (AiToolbar) covers all modes; this is
 * the extra, mode-specific affordance requested for markdown mode. Visibility
 * is gated by the `data-view-mode="markdown"` attribute on <html> via CSS, so
 * the link is inert in elegant/AI modes.
 */
export default function MarkdownModeLink() {
  // The .md URL is derived from the browser location, so only resolve client-side.
  const [href, setHref] = useState(null);
  useEffect(() => {
    setHref(getCleanMarkdownUrl());
  }, []);

  if (!href) return null;

  return (
    <a
      className={styles.markdownModeLink}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <i className="ph-bold ph-markdown-logo" aria-hidden="true" />
      <span>View this page as .md</span>
    </a>
  );
}
