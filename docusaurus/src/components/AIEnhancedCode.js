import React from 'react';
import CodeBlock from '@theme/CodeBlock';
import ContextualizedAIButton from './ContextualizedAIButton/ContextualizedAIButton';
import styles from './ai-enhanced-code.module.scss';

/**
 * AIEnhancedCode - A component for code examples with integrated AI assistance
 * Can be used directly in MDX files for specific code examples that need AI explanation
 * 
 * @param {string} children - The code content
 * @param {string} language - Programming language for syntax highlighting
 * @param {string} title - Optional title for the code block
 * @param {boolean} showAI - Whether to show the AI button (default: true)
 */
const AIEnhancedCode = ({ 
  children, 
  language = 'javascript', 
  title = '',
  showAI = true,
  ...props 
}) => {
  return (
    <div className={styles.aiEnhancedCode}>
      <CodeBlock
        language={language}
        title={title}
        {...props}
      >
        {children}
      </CodeBlock>
      {showAI && (
        <div className={styles.aiButtonContainer}>
          <ContextualizedAIButton 
            codeContent={children} 
            language={language}
          />
        </div>
      )}
    </div>
  );
};

export default AIEnhancedCode;