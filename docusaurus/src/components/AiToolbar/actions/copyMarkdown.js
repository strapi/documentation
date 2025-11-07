import { resolveDocContext, getRawMarkdownUrl } from '../utils/docContext';

export const copyMarkdownAction = async (context) => {
  const { docId, docPath, updateActionState } = context;

  try {
    if (updateActionState) {
      updateActionState('copy-markdown', 'loading');
    }

    const { docId: resolvedDocId, docPath: resolvedDocPath } = resolveDocContext(docId, docPath);
    const markdownUrl = getRawMarkdownUrl({ docId: resolvedDocId, docPath: resolvedDocPath });

    if (!markdownUrl) {
      throw new Error('Unable to determine document path');
    }

    const response = await fetch(markdownUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch markdown: ${response.status}`);
    }

    const markdownContent = await response.text();
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
