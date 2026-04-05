import React, { useRef, useEffect, useCallback } from 'react';
import CodeBlock from '@theme-original/CodeBlock';

// Terminal-type languages that get the macOS-style title bar + blinking cursor
const TERMINAL_LANGS = new Set([
  'bash', 'sh', 'shell', 'zsh', 'console', 'terminal',
  'powershell', 'cmd', 'batch',
]);

// Language display labels
const LANG_LABELS = {
  bash: 'BASH', sh: 'BASH', shell: 'BASH', zsh: 'ZSH',
  console: 'BASH', terminal: 'BASH', powershell: 'POWERSHELL',
  cmd: 'CMD', batch: 'CMD',
};

// Helper function to check if we should show the AI button
function shouldShowAIButton(codeContent) {
  if (!codeContent || typeof codeContent !== 'string') return false;
  const content = codeContent.trim();
  if (content.length <= 30) return false;

  const hasCodeStructures =
    (content.includes('\n') && content.split('\n').length > 1) ||
    content.includes('{') ||
    content.includes('function') ||
    content.includes('const ') ||
    content.includes('let ') ||
    content.includes('var ') ||
    content.includes('class ') ||
    content.includes('import ') ||
    content.includes('export ') ||
    content.includes('module.exports') ||
    content.includes('require(') ||
    content.includes('curl ') ||
    content.includes('GET ') ||
    content.includes('POST ') ||
    content.includes('PUT ') ||
    content.includes('DELETE ');

  if (!hasCodeStructures) return false;

  return true;
}

function handleAskAI(language, codeContent) {
  if (typeof window !== 'undefined' && window.Kapa) {
    const prompt = `Could you explain the code example below:\n\n\`\`\`${language}\n${codeContent}\n\`\`\``;
    window.Kapa.open({ query: prompt, submit: true });
  }
}

/**
 * Injects an "Ask AI" button into the Docusaurus button group
 * after the component mounts. This avoids wrapping the CodeBlock
 * in a container div which breaks its layout.
 */
function useInjectAIButton(ref, language, codeContent, showAI) {
  useEffect(() => {
    if (!showAI || !ref.current) return;

    const container = ref.current.querySelector('[class*="buttonGroup"]');
    if (!container) return;

    // Don't add if already there
    if (container.querySelector('.ai-button-injected')) return;

    const btn = document.createElement('button');
    btn.className = 'clean-btn ai-button-injected';
    btn.title = 'Ask AI to explain this code';
    btn.setAttribute('aria-label', 'Ask AI to explain this code example');
    btn.innerHTML = '<i class="ph ph-sparkle"></i><span>Ask AI</span>';
    btn.addEventListener('click', () => handleAskAI(language, codeContent));

    container.prepend(btn);

    return () => {
      btn.remove();
    };
  }, [ref, language, codeContent, showAI]);
}

// macOS-style title bar for terminal blocks
function TerminalTitleBar({ language, title, showAI, codeContent }) {
  const langLabel = LANG_LABELS[language] || (language ? language.toUpperCase() : '');
  const labelText = title || 'terminal';

  return (
    <div className="code-title-bar">
      <div className="code-title-bar__left">
        <div className="code-title-bar__dots">
          <span className="code-title-bar__dot code-title-bar__dot--close" />
          <span className="code-title-bar__dot code-title-bar__dot--minimize" />
          <span className="code-title-bar__dot code-title-bar__dot--maximize" />
        </div>
        {labelText && (
          <span className="code-title-bar__label">{labelText}</span>
        )}
      </div>
      <div className="code-title-bar__actions">
        {showAI && (
          <button
            className="clean-btn ai-button"
            title="Ask AI to explain this code"
            aria-label="Ask AI to explain this code example"
            onClick={() => handleAskAI(language, codeContent)}
          >
            <i className="ph ph-sparkle" />
            <span>Ask AI</span>
          </button>
        )}
        {langLabel && (
          <span className="code-title-bar__lang">{langLabel}</span>
        )}
      </div>
    </div>
  );
}

export default function CodeBlockWrapper(props) {
  const { children, className = '', ...otherProps } = props;
  const wrapperRef = useRef(null);

  let codeContent = '';
  if (typeof children === 'string') {
    codeContent = children;
  } else if (children?.props?.children) {
    codeContent = children.props.children;
  }

  const languageMatch = className.match(/language-(\w+)/);
  const language = languageMatch ? languageMatch[1] : '';
  const isTerminal = TERMINAL_LANGS.has(language);
  const docTitle = otherProps.title || '';
  const showAI = shouldShowAIButton(codeContent);

  // Inject AI button into Docusaurus button group for non-terminal blocks
  useInjectAIButton(wrapperRef, language, codeContent?.trim(), showAI && !isTerminal);

  // Inject a real DOM cursor element into terminal blocks
  // (CSS ::after pseudo-elements get their background overridden by parent rules)
  const terminalRef = useRef(null);
  const injectCursor = useCallback((node) => {
    terminalRef.current = node;
    if (!node) return;

    // Find the last token line and append a real cursor span
    const injectCursorElement = () => {
      // Remove any previously injected cursor
      const existing = node.querySelector('.terminal-cursor');
      if (existing) existing.remove();

      const codeEl = node.querySelector('code');
      if (!codeEl) return;

      const lastLine = codeEl.querySelector('.token-line:last-child');
      if (!lastLine) return;

      const cursor = document.createElement('span');
      cursor.className = 'terminal-cursor';

      // Insert before the trailing <br> so the cursor stays on the same line
      const lastBr = lastLine.querySelector('br:last-child');
      if (lastBr) {
        lastLine.insertBefore(cursor, lastBr);
        lastBr.remove();
      } else {
        lastLine.appendChild(cursor);
      }
    };

    // Run after Docusaurus finishes rendering the code block
    requestAnimationFrame(() => {
      requestAnimationFrame(injectCursorElement);
    });
  }, []);

  // Terminal blocks: macOS-style wrapper with title bar + blinking cursor
  if (isTerminal) {
    return (
      <div className="code-block-enhanced" ref={injectCursor}>
        <TerminalTitleBar
          language={language}
          title={docTitle}
          showAI={showAI}
          codeContent={codeContent?.trim()}
        />
        <CodeBlock className={className} {...otherProps}>
          {children}
        </CodeBlock>
      </div>
    );
  }

  // Non-terminal blocks: standard rendering, AI button injected via useEffect
  return (
    <div ref={wrapperRef}>
      <CodeBlock className={className} {...otherProps}>
        {children}
      </CodeBlock>
    </div>
  );
}
