import React, { useState, useEffect } from 'react';
import { useLocation } from '@docusaurus/router';
import { useViewMode } from './ViewModeContext';
import styles from './aiPanel.module.scss';

/**
 * Extracts Tldr content from the current page DOM.
 * The Tldr component renders as <blockquote class="tldr">.
 */
function useTldrContent(viewMode) {
  const [tldrText, setTldrText] = useState('');
  const { pathname } = useLocation();

  useEffect(() => {
    if (viewMode !== 'ai') return;

    const timer = setTimeout(() => {
      const tldrEl = document.querySelector('.tldr');
      if (tldrEl) {
        const clone = tldrEl.cloneNode(true);
        const strong = clone.querySelector('strong');
        if (strong) strong.remove();
        const icon = clone.querySelector('[class*="ph-"]');
        if (icon) icon.remove();
        setTldrText(clone.textContent.trim());
      } else {
        setTldrText('');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, viewMode]);

  return tldrText;
}

/**
 * Opens the Kapa AI modal with context about the current page.
 * MVP fallback -- will be replaced with inline embed if Kapa supports it.
 */
function openKapaWithContext() {
  const kapaButton = document.querySelector('[class*="kapa-widget-button"]');
  if (kapaButton) {
    kapaButton.click();
  }
}

export default function AiPanel() {
  const { viewMode, setViewMode } = useViewMode();
  const isOpen = viewMode === 'ai';
  const tldrText = useTldrContent(viewMode);

  return (
    <aside
      className={`${styles.aiPanel} ${isOpen ? styles.aiPanelOpen : ''}`}
      aria-hidden={!isOpen}
    >
      <div className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => setViewMode('elegant')}
          aria-label="Back to page"
        >
          <i className="ph-bold ph-arrow-left" />
          Back
        </button>
        <h3>AI Assistant</h3>
        <button
          className={styles.closeButton}
          onClick={() => setViewMode('elegant')}
          aria-label="Close AI panel"
        >
          <i className="ph-bold ph-x" />
        </button>
      </div>

      <div className={styles.content}>
        {tldrText ? (
          <div className={styles.summary}>
            <h4>Page Summary</h4>
            <p>{tldrText}</p>
          </div>
        ) : (
          <p className={styles.noSummary}>No summary available for this page.</p>
        )}

        <hr className={styles.divider} />

        <p className={styles.chatPrompt}>
          What would you like to know more about this topic?
        </p>

        <button
          className={styles.chatTrigger}
          onClick={openKapaWithContext}
        >
          <i className="ph-bold ph-chat-circle" />
          Ask AI about this page
        </button>
      </div>
    </aside>
  );
}
