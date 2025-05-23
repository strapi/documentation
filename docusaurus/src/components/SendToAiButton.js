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
      
      // Show success message
      alert(`✅ Prompt copied to clipboard! Paste it in ${currentAI} to start chatting.`);
      
    } catch (error) {
      console.error('Clipboard failed:', error);
      // If clipboard fails, select all text for manual copy
      if (textareaRef.current) {
        textareaRef.current.select();
        textareaRef.current.setSelectionRange(0, 99999); // For mobile
        alert('❌ Auto-copy failed. Please manually copy the selected text (Ctrl+C / Cmd+C)');
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
        🤖 <span style={{ marginLeft: '0.5rem', marginRight: '0.25rem' }}>Send to AI</span> {isOpen ? '▲' : '▼'}
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
          >
            ✨ <span style={{ marginLeft: '10px' }}>Send to ChatGPT</span>
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
          >
            💬 <span style={{ marginLeft: '10px' }}>Send to Claude</span>
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
            <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>
              📋 Copy this prompt to {currentAI}
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
                  fontWeight: 'bold'
                }}
              >
                📋 Copy & Open {currentAI}
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