import React, { useState, useCallback, useRef } from 'react';

const SendToAIButton = ({ Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [currentAI, setCurrentAI] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const textareaRef = useRef(null);

  // Calculate dropdown position
  const calculatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX
      });
    }
  }, []);

  // Get current document info
  const getCurrentDocId = () => {
    if (typeof window === 'undefined') return null;
    const path = window.location.pathname;
    const segments = path.replace(/^\/|\/$/g, '').split('/');
    return segments.length >= 2 ? segments.join('/') : null;
  };

  const getCurrentDocPath = () => {
    if (typeof window === 'undefined') return null;
    const path = window.location.pathname;
    const cleanPath = path.replace(/^\/|\/$/g, '');
    return cleanPath ? `docs/${cleanPath}.md` : null;
  };

  // Fetch markdown content
  const fetchMarkdownContent = async () => {
    const currentDocId = getCurrentDocId();
    const currentDocPath = getCurrentDocPath();
    
    if (!currentDocId && !currentDocPath) {
      throw new Error('Could not determine document path');
    }

    const baseUrl = 'https://raw.githubusercontent.com/strapi/documentation/main/docusaurus';
    const markdownUrl = currentDocPath 
      ? `${baseUrl}/${currentDocPath}` 
      : `${baseUrl}/docs/${currentDocId}.md`;
    
    const response = await fetch(markdownUrl);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
    return await response.text();
  };

  // Build prompt
  const buildPrompt = (markdownContent) => {
    return `You're a Strapi documentation expert. Please use this content as context and get ready to answer my questions:

---

${markdownContent}

---

I'm ready for your questions about this Strapi documentation!`;
  };

  // Handle AI selection
  const handleAIClick = useCallback(async (aiType) => {
    setIsLoading(true);
    setIsOpen(false);
    
    try {
      const markdownContent = await fetchMarkdownContent();
      const prompt = buildPrompt(markdownContent);
      
      setCurrentPrompt(prompt);
      setCurrentAI(aiType);
      setShowPromptModal(true);
      
    } catch (error) {
      console.error('Error fetching content:', error);
      alert('Error: Could not fetch the markdown content');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle copy from modal
  const handleCopyFromModal = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentPrompt);
      
      // Open the AI tool
      const url = currentAI === 'ChatGPT' 
        ? 'https://chat.openai.com/' 
        : 'https://claude.ai/chat';
      window.open(url, '_blank');
      
      // Close modal
      setShowPromptModal(false);
      
      // Show elegant notification instead of alert
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 12px 16px;
        border-radius: 6px;
        z-index: 1000001;
        font-family: inherit;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-width: 300px;
        display: flex;
        align-items: center;
        gap: 8px;
      `;
      notification.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
        Prompt copied! Paste it in ${currentAI}
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 4000);
      
    } catch (error) {
      console.error('Clipboard failed:', error);
      // If clipboard fails, select all text for manual copy
      if (textareaRef.current) {
        textareaRef.current.select();
        textareaRef.current.setSelectionRange(0, 99999); // For mobile
        
        // Show warning notification instead of alert
        const notification = document.createElement('div');
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #ffc107;
          color: #212529;
          padding: 12px 16px;
          border-radius: 6px;
          z-index: 1000001;
          font-family: inherit;
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          max-width: 300px;
          display: flex;
          align-items: center;
          gap: 8px;
        `;
        notification.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.966-.833-2.732 0L3.866 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
          Auto-copy failed. Please copy manually (Ctrl+C)
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 5000);
      }
    }
  }, [currentPrompt, currentAI]);

  const handleToggle = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isOpen) {
      calculatePosition();
    }
    setIsOpen(prev => !prev);
  }, [isOpen, calculatePosition]);

  if (!getCurrentDocId()) return null;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        disabled={isLoading}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0',
          border: 'none',
          backgroundColor: 'transparent',
          color: 'var(--strapi-primary-600)',
          fontSize: 'var(--strapi-font-size-xs)',
          fontWeight: '500',
          cursor: 'pointer',
          textDecoration: 'none'
        }}
      >
        {/* Robot icon */}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem' }}>
          <rect x="3" y="11" width="18" height="10" rx="2" ry="2"/>
          <circle cx="12" cy="5" r="2"/>
          <path d="M12 7v4"/>
          <line x1="8" y1="16" x2="8" y2="16"/>
          <line x1="16" y1="16" x2="16" y2="16"/>
        </svg>
        <span style={{ marginRight: '0.25rem' }}>Send to AI</span>
        {/* Caret icon */}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
          zIndex: 999999,
          minWidth: '180px'
        }}>
          <button
            onClick={() => handleAIClick('ChatGPT')}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              borderBottom: '1px solid #eee'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            {/* Sparkle icon for ChatGPT */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '10px' }}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span>Send to ChatGPT</span>
          </button>
          <button
            onClick={() => handleAIClick('Claude')}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            {/* Chat circle icon for Claude */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '10px' }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>Send to Claude</span>
          </button>
        </div>
      )}
      
      {/* Prompt Modal */}
      {showPromptModal && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Clipboard icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Copy this prompt to {currentAI}
            </h3>
            <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px' }}>
              The prompt below contains the documentation content. Copy it and paste it in {currentAI} to start chatting!
            </p>
            
            <textarea
              ref={textareaRef}
              value={currentPrompt}
              readOnly
              style={{
                width: '100%',
                height: '300px',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'monospace',
                resize: 'vertical',
                backgroundColor: '#f9f9f9'
              }}
            />
            
            <div style={{ 
              marginTop: '16px', 
              display: 'flex', 
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowPromptModal(false)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #ccc',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCopyFromModal}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  backgroundColor: '#007bff',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {/* Copy icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy & Open {currentAI}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          padding: '8px 12px',
          backgroundColor: '#f0f0f0',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 999999
        }}>
          Loading...
        </div>
      )}
    </>
  );
};

export default SendToAIButton;