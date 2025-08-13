import React from 'react';
import CodeBlock from '@theme-original/CodeBlock';
import ContextualizedAIButton from '../../components/ContextualizedAIButton/ContextualizedAIButton';
import styles from './enhanced-codeblock.module.scss';

export default function CodeBlockWrapper(props) {
  // Extract code content and language
  const { children, className = '', title, ...otherProps } = props;
  
  // Get the code content
  let codeContent = '';
  if (typeof children === 'string') {
    codeContent = children;
  } else if (children?.props?.children) {
    codeContent = children.props.children;
  }
  
  // Extract language from className (format: "language-javascript")
  const languageMatch = className.match(/language-(\w+)/);
  const language = languageMatch ? languageMatch[1] : '';
  
  // Only show AI button for substantial code examples (more than 20 characters)
  // and exclude very short snippets or single words
  const shouldShowAIButton = codeContent && 
    typeof codeContent === 'string' && 
    codeContent.trim().length > 20 &&
    !codeContent.includes('npm install') && // Exclude package installation commands
    !codeContent.includes('yarn add') &&
    !codeContent.includes('cd ') && // Exclude directory navigation
    codeContent.includes('\n') || codeContent.includes('{') || codeContent.includes('function'); // Include if multi-line or contains code structures

  return (
    <div className={styles.enhancedCodeBlock}>
      <CodeBlock 
        className={className}
        title={title}
        {...otherProps}
      >
        {children}
      </CodeBlock>
      {shouldShowAIButton && (
        <div className={styles.aiButtonContainer}>
          <ContextualizedAIButton 
            codeContent={codeContent.trim()} 
            language={language}
          />
        </div>
      )}
    </div>
  );
}