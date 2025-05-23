import React, { useState, useCallback } from 'react';
import { useActiveDocContext } from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import clsx from 'clsx';
import Icon from './Icon';

const CopyMarkdownButton = ({ className }) => {
  const [copyStatus, setCopyStatus] = useState('');
  const { activeDoc } = useActiveDocContext();
  const { siteConfig } = useDocusaurusContext();

  const handleCopyMarkdown = useCallback(async () => {
    if (!activeDoc) {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus(''), 3000);
      return;
    }

    try {
      // Build the raw markdown URL from GitHub
      const baseUrl = 'https://raw.githubusercontent.com/strapi/documentation/main/docusaurus';
      const markdownUrl = `${baseUrl}/docs/${activeDoc.id}.md`;
      
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
  }, [activeDoc]);

  // Don't render if no active document
  if (!activeDoc) {
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
      className={clsx(
        'copy-markdown-button',
        {
          'copy-markdown-button--success': copyStatus === 'success',
          'copy-markdown-button--error': copyStatus === 'error',
        },
        className
      )}
      title="Copy the raw markdown content of this page"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        border: '1px solid var(--strapi-neutral-200)',
        borderRadius: '4px',
        backgroundColor: 'var(--strapi-neutral-0)',
        color: 'var(--strapi-neutral-700)',
        fontSize: '13px',
        fontWeight: '500',
        cursor: copyStatus === 'success' ? 'default' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: copyStatus === 'success' ? 0.7 : 1,
      }}
    >
      <Icon 
        name={getStatusIcon()} 
        classes="ph-fill"
        color={
          copyStatus === 'success' ? 'var(--strapi-success-600)' :
          copyStatus === 'error' ? 'var(--strapi-danger-600)' :
          'var(--strapi-neutral-500)'
        }
      />
      {getStatusText()}
    </button>
  );
};

export default CopyMarkdownButton;