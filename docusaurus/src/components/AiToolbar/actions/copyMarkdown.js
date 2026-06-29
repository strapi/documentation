import { resolveDocContext, getRawMarkdownUrl, getCleanMarkdownUrl } from '../utils/docContext';

export const copyMarkdownAction = async (context) => {
  const { docId, docPath, updateActionState } = context;

  try {
    if (updateActionState) {
      updateActionState('copy-markdown', 'loading');
    }

    const { docId: resolvedDocId, docPath: resolvedDocPath } = resolveDocContext(docId, docPath);

    // Prefer the clean, generated per-page .md (JSX resolved, snippets inlined,
    // API code surfaced); fall back to the raw MDX on GitHub if the .md isn't
    // available (older deploys, or a page not yet generated).
    const cleanUrl = getCleanMarkdownUrl();
    const rawUrl = getRawMarkdownUrl({ docId: resolvedDocId, docPath: resolvedDocPath });

    if (!cleanUrl && !rawUrl) {
      throw new Error('Unable to determine document path');
    }

    let markdownContent = null;
    if (cleanUrl) {
      try {
        const res = await fetch(cleanUrl);
        if (res.ok) markdownContent = await res.text();
      } catch (e) {
        // network/CORS issue — fall back to the raw source below
      }
    }
    if (markdownContent === null) {
      if (!rawUrl) {
        throw new Error('Unable to determine document path');
      }
      const response = await fetch(rawUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch markdown: ${response.status}`);
      }
      markdownContent = await response.text();
    }

    await navigator.clipboard.writeText(markdownContent);

    if (updateActionState) {
      updateActionState('copy-markdown', 'success');
      setTimeout(() => updateActionState('copy-markdown', 'idle'), 3000);
    }
  } catch (error) {
    console.error('Error copying markdown:', error);

    if (updateActionState) {
      updateActionState('copy-markdown', 'error');
      setTimeout(() => updateActionState('copy-markdown', 'idle'), 3000);
    }
  }
};
