import { resolveDocContext, getCleanMarkdownUrl, getRawMarkdownUrl } from '../utils/docContext';

/**
 * Open the current page's clean Markdown (`<page-url>.md`) in a new tab.
 * This is the generated, JSX-resolved Markdown (same content as llms-full.txt),
 * NOT the raw MDX source. Falls back to the raw GitHub MDX only if the clean
 * URL can't be determined (e.g. homepage).
 */
export const viewMarkdownAction = (context) => {
  const { docId, docPath, closeDropdown } = context;

  const cleanUrl = getCleanMarkdownUrl();
  let targetUrl = cleanUrl;

  if (!targetUrl) {
    const { docId: resolvedDocId, docPath: resolvedDocPath } = resolveDocContext(docId, docPath);
    targetUrl = getRawMarkdownUrl({ docId: resolvedDocId, docPath: resolvedDocPath });
  }

  if (!targetUrl) {
    console.error('View Markdown action: unable to determine a Markdown URL');
    return;
  }

  window.open(targetUrl, '_blank');

  if (closeDropdown) {
    closeDropdown();
  }
};
