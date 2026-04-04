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
    content.includes('require(');

  if (!hasCodeStructures) return false;

  const excludePatterns = [
    'npm install', 'yarn add', 'yarn install', 'npm run', 'yarn run',
    'cd ', 'ls ', 'mkdir ', 'strapi generate', 'strapi develop',
    'strapi build', 'strapi start'
  ];
  if (excludePatterns.some(pattern => content.includes(pattern))) return false;
  if (content.match(/^[\/\w\-\.]+$/) || content.match(/^\w+:\s*\w+$/)) return false;

  return true;
}

// macOS-style title bar for terminal blocks
function TerminalTitleBar({ language, title, showAI, codeContent }) {
  const langLabel = LANG_LABELS[language] || (language ? language.toUpperCase() : '');
  const labelText = title || 'terminal';

  function handleAskAI() {
    if (typeof window !== 'undefined' && window.Kapa) {
      const prompt = `Could you explain the code example below:\n\n\`\`\`${language}\n${codeContent}\n\`\`\``;
      window.Kapa.open({ query: prompt, submit: true });
    }
  }

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
            onClick={handleAskAI}
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

  // Non-terminal blocks: standard rendering
  // (Docusaurus provides copy/wrap buttons natively)
  return (
    <CodeBlock className={className} {...otherProps}>
      {children}
    </CodeBlock>
  );
}
