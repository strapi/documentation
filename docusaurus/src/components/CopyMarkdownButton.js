import React, { useState, useCallback } from 'react';

// Simple Icon component fallback if not available
const IconFallback = ({ name, color = 'currentColor' }) => {
  const getIcon = () => {
    switch (name) {
      case 'check-circle':
        return '✓';
      case 'warning-circle':
        return '⚠';
      case 'copy':
      default:
        return '📋';
    }
  };
  
  return (
    <span style={{ color, fontSize: '14px', position: 'relative', top: '-1px' }}>
      {getIcon()}
    </span>
  );
};

const CopyMarkdownButton = ({ className, docId, docPath, Icon }) => {
  const [copyStatus, setCopyStatus] = useState('');
  
  // Use provided Icon component or fallback
  const IconComponent = Icon || IconFallback;

  const handleCopyMarkdown = useCallback(async () => {
    // Use props or try to get from current URL
    const currentDocId = docId || getCurrentDocId();
    const currentDocPath = docPath || getCurrentDocPath();
    
    if (!currentDocId && !currentDocPath) {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus(''), 3000);
      return;
    }

    try {
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
      
      setCopyStatus('success');
      setTimeout(() => setCopyStatus(''), 3000);
      
    } catch (error) {
      console.error('Error copying markdown:', error);
      setCopyStatus('error');
      setTimeout(() => setCopyStatus(''), 3000);
    }
  }, [docId, docPath]);

  // Helper functions to get current document info from URL
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

  // Don't render if no way to determine document
  if (!docId && !docPath && !getCurrentDocId()) {
    return null;
  }

  const getStatusIcon = () => {
    switch (copyStatus) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'warning-circle';
      default:
        return 'copy';
    }
  };

  const getStatusText = () => {
    switch (copyStatus) {
      case 'success':
        return 'Markdown copied!';
      case 'error':
        return 'Copy failed';
      default:
        return 'Copy Markdown';
    }
  };

  return (
    <button
      onClick={handleCopyMarkdown}
      disabled={copyStatus === 'success'}
      className={[
        'copy-markdown-button',
        copyStatus === 'success' ? 'copy-markdown-button--success' : '',
        copyStatus === 'error' ? 'copy-markdown-button--error' : '',
        className || ''
      ].filter(Boolean).join(' ')}
      title="Copy the raw markdown content of this page"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0',
        border: 'none',
        borderRadius: '0',
        backgroundColor: 'transparent',
        color: '#4945FF',
        fontSize: '12px',
        fontWeight: '500',
        cursor: copyStatus === 'success' ? 'default' : 'pointer',
        textDecoration: 'none',
        opacity: copyStatus === 'success' ? 0.7 : 1,
      }}
    >
      <IconComponent 
        name={getStatusIcon()}
        color={
          copyStatus === 'success' ? '#2F6846' :
          copyStatus === 'error' ? '#D02B20' :
          '#4945FF'
        }
      />
      <span style={{ 
        color: copyStatus === 'success' ? '#2F6846' :
               copyStatus === 'error' ? '#D02B20' :
               '#4945FF'
      }}>
        {getStatusText()}
      </span>
    </button>
  );
};

export default CopyMarkdownButton;