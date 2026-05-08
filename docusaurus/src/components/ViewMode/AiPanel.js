import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from '@docusaurus/router';
import { KapaProvider, useChat } from '@kapaai/react-sdk';
import ReactMarkdown from 'react-markdown';
import { useViewMode } from './ViewModeContext';
import styles from './aiPanel.module.scss';

const KAPA_INTEGRATION_ID = 'e35b7c7b-7ec8-4c1a-8a39-0ab7b6d8db3a';

/**
 * Finds page headings that are mentioned in an AI answer.
 * Returns an array of { id, text } for headings referenced in the answer.
 */
function findMatchingHeadings(answerText) {
  if (!answerText) return [];
  const headings = document.querySelectorAll('article h2[id], article h3[id]');
  const matches = [];
  const answerLower = answerText.toLowerCase();

  headings.forEach((h) => {
    const text = h.textContent.trim();
    // Match if the heading text (or a significant portion) appears in the answer
    if (text.length > 3 && answerLower.includes(text.toLowerCase())) {
      matches.push({ id: h.id, text });
    }
  });

  return matches;
}

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

function ChatInterface({ pageContext }) {
  const [question, setQuestion] = useState('');
  const messagesEndRef = useRef(null);
  const { conversation, submitQuery, resetConversation, isGeneratingAnswer } = useChat();
  const { pathname } = useLocation();

  // Reset conversation on page navigation
  useEffect(() => {
    if (conversation.length > 0) {
      resetConversation();
    }
  }, [pathname]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim() && !isGeneratingAnswer) {
      // On the first message, prefix with page context so Kapa knows what page we're on
      let query = question;
      if (conversation.length === 0 && pageContext) {
        query = `[Context: The user is reading the Strapi documentation page "${pageContext.title}" at ${pageContext.url}. Page summary: ${pageContext.summary}]\n\n${question}`;
      }
      submitQuery(query);
      setQuestion('');
    }
  };

  return (
    <>
      <div className={styles.chatMessages}>
        {conversation.length === 0 ? (
          <p className={styles.chatPrompt}>
            What would you like to know more about this topic?
          </p>
        ) : (
          conversation.map((qa, index) => (
            <div key={index} className={styles.messageGroup}>
              <div className={styles.userMessage}>
                {/* Strip the context prefix from display */}
                {qa.question.replace(/^\[Context:.*?\]\n\n/s, '')}
              </div>
              <div className={styles.aiMessage}>
                {qa.answer ? (
                  <>
                    <div className={styles.answerText}>
                      <ReactMarkdown>{qa.answer}</ReactMarkdown>
                    </div>
                    {qa.sources && qa.sources.length > 0 && (
                      <div className={styles.sources}>
                        <span className={styles.sourcesLabel}>Sources:</span>
                        {qa.sources.map((source, i) => (
                          <a
                            key={i}
                            href={source.source_url}
                            className={styles.sourceLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {source.title}
                          </a>
                        ))}
                      </div>
                    )}
                    {(() => {
                      const headings = findMatchingHeadings(qa.answer);
                      if (headings.length === 0) return null;
                      return (
                        <div className={styles.jumpLinks}>
                          <span className={styles.sourcesLabel}>Jump to:</span>
                          {headings.map((h) => (
                            <button
                              key={h.id}
                              className={styles.jumpButton}
                              onClick={() => {
                                const el = document.getElementById(h.id);
                                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }}
                            >
                              <i className="ph-bold ph-arrow-square-out" /> {h.text}
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <div className={styles.thinking}>
                    <span>Thinking</span>
                    <span className={styles.thinkingDots}>
                      <span className={styles.dot} />
                      <span className={styles.dot} />
                      <span className={styles.dot} />
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {conversation.length > 0 && (
        <div className={styles.chatActions}>
          <button
            className={styles.chatActionButton}
            onClick={() => {
              const lastAnswer = [...conversation].reverse().find(qa => qa.answer)?.answer;
              if (lastAnswer) {
                navigator.clipboard.writeText(lastAnswer);
              }
            }}
            title="Copy last answer"
          >
            <i className="ph-bold ph-copy" /> Copy
          </button>
          <button
            className={styles.chatActionButton}
            onClick={resetConversation}
            title="Clear conversation"
          >
            <i className="ph-bold ph-trash" /> Clear
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.chatInput}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          className={styles.textInput}
          disabled={isGeneratingAnswer}
        />
        <button
          type="submit"
          disabled={!question.trim() || isGeneratingAnswer}
          className={styles.sendButton}
          aria-label="Send question"
        >
          <i className="ph-bold ph-paper-plane-right" />
        </button>
      </form>
    </>
  );
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
        <h3>Strapi Docs AI Assistant</h3>
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

        <KapaProvider integrationId={KAPA_INTEGRATION_ID} callbacks={{ askAI: {} }}>
          <ChatInterface pageContext={{
            title: document.querySelector('article h1')?.textContent || '',
            url: window.location.href,
            summary: tldrText,
          }} />
        </KapaProvider>
      </div>
    </aside>
  );
}
