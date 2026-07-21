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
    btn.innerHTML = '<i class="ph-fill ph-sparkle"></i><span>Ask AI</span>';
    btn.addEventListener('click', () => handleAskAI(language, codeContent));

    container.prepend(btn);

    return () => {
      btn.remove();
    };
  }, [ref, language, codeContent, showAI]);
}

// macOS-style title bar for terminal blocks
function TerminalTitleBar({ language, title, showAI, codeContent }) {
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
            <i className="ph-fill ph-sparkle" />
            <span>Ask AI</span>
          </button>
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

  // Terminal blocks render their own title bar (with the Ask AI button) as a
  // sibling of the Docusaurus code block, while the native copy/wrap buttons
  // live deep inside the code block. Rather than align the two across separate
  // DOM subtrees with brittle absolute positioning, physically MOVE the native
  // button group into the title bar's actions container so Ask AI + wrap + copy
  // sit in one flex row and align naturally.
  const relocateButtons = useCallback((wrapper) => {
    if (!wrapper) return;
    const move = () => {
      const actions = wrapper.querySelector('.code-title-bar__actions');
      if (!actions) return;
      // Move the native copy/wrap group into the title bar. React can re-render
      // its own group inside the code block afterwards, so also remove any
      // stray groups left outside the title bar to avoid a duplicate button.
      const groups = wrapper.querySelectorAll('[class*="buttonGroup"]');
      let kept = actions.querySelector('[class*="buttonGroup"]');
      groups.forEach((group) => {
        if (group.closest('.code-title-bar__actions')) return; // already in the bar
        if (!kept) {
          actions.appendChild(group); // move the first one into the bar
          kept = group;
        } else {
          group.remove(); // drop duplicates left in the code area
        }
      });
    };
    // Run now and keep watching: React may re-insert a group after our move.
    requestAnimationFrame(() => requestAnimationFrame(move));
    const observer = new MutationObserver(move);
    observer.observe(wrapper, { childList: true, subtree: true });
    // Stop observing shortly after mount once the DOM has settled.
    setTimeout(() => observer.disconnect(), 2000);
  }, []);

  // Ref callback for the terminal wrapper. Only relocates the action buttons
  // into the title bar; the blinking end-of-line cursor was removed.
  const injectCursor = useCallback((node) => {
    terminalRef.current = node;
    if (node) relocateButtons(node);
  }, [relocateButtons]);

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
