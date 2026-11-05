import React, { useState, useEffect, useRef } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useLocation } from '@docusaurus/router';
import { KapaProvider, useChat } from '@kapaai/react-sdk';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useViewMode } from './ViewModeContext';
import AgentBot from '../AgentBot/AgentBot';
import styles from './aiPanel.module.scss';

const KAPA_INTEGRATION_ID = 'e35b7c7b-7ec8-4c1a-8a39-0ab7b6d8db3a';

function CodeBlock({ children, ...props }) {
  const [copied, setCopied] = useState(false);
  const codeText = typeof children === 'string'
    ? children
    : React.Children.toArray(children).map(c =>
        typeof c === 'string' ? c : c?.props?.children || ''
      ).join('');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.codeBlockWrapper}>
      <button
        className={styles.copyCodeButton}
        onClick={handleCopy}
        aria-label="Copy code"
      >
        <i className={copied ? 'ph-bold ph-check' : 'ph-bold ph-copy'} />
      </button>
      <pre {...props}>{children}</pre>
    </div>
  );
}

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

/**
 * Maps the Kapa chat status to a mascot state: thinking while connecting,
 * working while streaming, a short happy "done" once the answer is complete,
 * idle otherwise. A failed request leaves it idle: the error is the service's,
 * not the reader's, so the mascot never gets angry at them.
 */
function useBotState({ isPreparingAnswer, isGeneratingAnswer, error }) {
  const [justDone, setJustDone] = useState(false);
  const wasBusy = useRef(false);
  const busy = isPreparingAnswer || isGeneratingAnswer;

  useEffect(() => {
    if (wasBusy.current && !busy && !error) {
      setJustDone(true);
      const timer = setTimeout(() => setJustDone(false), 2500);
      wasBusy.current = busy;
      return () => clearTimeout(timer);
    }
    wasBusy.current = busy;
    return undefined;
  }, [busy, error]);

  if (error) return 'idle';
  if (isPreparingAnswer) return 'think';
  if (isGeneratingAnswer) return 'work';
  if (justDone) return 'done';
  return 'idle';
}

function ChatInterface({ pageContext, onBotStateChange }) {
  const [question, setQuestion] = useState('');
  const messagesEndRef = useRef(null);
  const {
    conversation,
    submitQuery,
    resetConversation,
    isPreparingAnswer,
    isGeneratingAnswer,
    error,
  } = useChat();
  const { pathname } = useLocation();
  const botState = useBotState({ isPreparingAnswer, isGeneratingAnswer, error });

  useEffect(() => {
    onBotStateChange?.(botState);
  }, [botState]);

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
                      <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{ pre: CodeBlock }}
                        >{qa.answer}</ReactMarkdown>
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
                ) : error && index === conversation.length - 1 ? (
                  <p className={styles.chatError}>
                    Sorry, I couldn't get an answer this time. Please try again in a moment.
                  </p>
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
  const { viewMode, setViewMode, leavingAi } = useViewMode();
  const isOpen = viewMode === 'ai';
  const tldrText = useTldrContent(viewMode);
  const [botState, setBotState] = useState('idle');
  const [greeting, setGreeting] = useState(false);

  // Lexi waves hello when the panel opens
  useEffect(() => {
    if (!isOpen) return undefined;
    setGreeting(true);
    const timer = setTimeout(() => setGreeting(false), 1800);
    return () => clearTimeout(timer);
  }, [isOpen]);

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
        <div className={styles.title}>
          <AgentBot state={leavingAi || greeting ? 'wave' : botState} size={64} decorative />
          <h3>
            <span className={styles.titleName}>Hi! I'm Lexi,</span>
            <span className={styles.titleRole}>Strapi Docs AI Assistant</span>
          </h3>
        </div>
        <button
          className={styles.closeButton}
          onClick={() => setViewMode('elegant')}
          aria-label="Close AI panel"
        >
          <i className="ph-bold ph-x" />
        </button>
      </div>
      <p className={styles.headerHint}>
        {/* Desktop closes with the ✕ (top right); mobile uses the "Back" button
            (top left, the ✕ is hidden there). Show the matching hint per device. */}
        <em className={styles.headerHintDesktop}>
          To get back to elegant or markdown mode, click the <i className="ph-bold ph-x" aria-hidden="true" /> in the upper right corner.
        </em>
        <em className={styles.headerHintMobile}>
          To get back to elegant or markdown mode, tap <i className="ph-bold ph-arrow-left" aria-hidden="true" /> Back in the upper left corner.
        </em>
      </p>

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

        <BrowserOnly>
          {() => (
            <KapaProvider integrationId={KAPA_INTEGRATION_ID} callbacks={{ askAI: {} }}>
              <ChatInterface onBotStateChange={setBotState} pageContext={{
                title: document.querySelector('article h1')?.textContent || '',
                url: window.location.href,
                summary: tldrText,
              }} />
            </KapaProvider>
          )}
        </BrowserOnly>
      </div>
    </aside>
  );
}
