import React from 'react';
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

// AI "Ask AI" floating button for non-terminal code blocks
function AIButton({ language, codeContent }) {
  return (
    <button
      className="clean-btn ai-button ai-button--floating"
      title="Ask AI to explain this code"
      aria-label="Ask AI to explain this code example"
      onClick={() => handleAskAI(language, codeContent)}
    >
      <i className="ph ph-sparkle" />
      <span>Ask AI</span>
    </button>
  );
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

  // Terminal blocks: macOS-style wrapper with title bar + blinking cursor (CSS)
  if (isTerminal) {
    return (
      <div className="code-block-enhanced">
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

  // Non-terminal blocks: standard rendering with floating AI button
  if (showAI) {
    return (
      <div className="code-block-enhanced code-block-enhanced--with-ai">
        <CodeBlock className={className} {...otherProps}>
          {children}
        </CodeBlock>
        <AIButton language={language} codeContent={codeContent?.trim()} />
      </div>
    );
  }

  return (
    <CodeBlock className={className} {...otherProps}>
      {children}
    </CodeBlock>
  );
}
