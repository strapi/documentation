export const copyMarkdownAction = async (context) => {
  const { docId, docPath, updateActionState } = context;
  
  try {
    updateActionState('copy-markdown', 'loading');
    
    // Helper functions to get current document info from URL (reused from CopyMarkdownButton)
    const getCurrentDocId = () => {
      if (typeof window === 'undefined') return null;
      const path = window.location.pathname;
      // Remove leading/trailing slashes and split
      const segments = path.replace(/^\/|\/$/g, '').split('/');
      // For paths like /cms/api/rest or /cloud/getting-started/intro
      if (segments.length >= 2) {
        return segments.join('/');
      }
      return null;
    };

    const getCurrentDocPath = () => {
      if (typeof window === 'undefined') return null;
      const path = window.location.pathname;
      // Convert URL path to docs file path
      const cleanPath = path.replace(/^\/|\/$/g, '');
      return cleanPath ? `docs/${cleanPath}.md` : null;
    };

    // Use props or try to get from current URL
    const currentDocId = docId || getCurrentDocId();
    const currentDocPath = docPath || getCurrentDocPath();
    
    if (!currentDocId && !currentDocPath) {
      throw new Error('Unable to determine document path');
    }

    // Build the raw markdown URL from GitHub
    const baseUrl = 'https://raw.githubusercontent.com/strapi/documentation/main/docusaurus';
    const markdownUrl = currentDocPath 
      ? `${baseUrl}/${currentDocPath}` 
      : `${baseUrl}/docs/${currentDocId}.md`;
    
    // Fetch the raw markdown content
    const response = await fetch(markdownUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch markdown: ${response.status}`);
    }
    
    const markdownContent = await response.text();
    
    // Copy to clipboard
    await navigator.clipboard.writeText(markdownContent);
    
    updateActionState('copy-markdown', 'success');
    setTimeout(() => updateActionState('copy-markdown', 'idle'), 3000);
    
  } catch (error) {
    console.error('Error copying markdown:', error);
    updateActionState('copy-markdown', 'error');
    setTimeout(() => updateActionState('copy-markdown', 'idle'), 3000);
  }
};