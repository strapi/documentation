import React from 'react';
import Icon from '../Icon';
import styles from './contextualized-ai-button.module.scss';

const ContextualizedAIButton = ({ codeContent, language = '' }) => {
  const handleAskAI = () => {
    // Check if Kapa widget is available
    if (typeof window !== 'undefined' && window.Kapa) {
      const prompt = `Could you explain the code example below:

\`\`\`${language}
${codeContent}
\`\`\``;

      // Open Kapa widget with the contextualized prompt
      window.Kapa.open({
        query: prompt,
        submit: true
      });
    } else {
      console.warn('Kapa widget not available');
    }
  };

  return (
    <button 
      className={styles.contextualizedAiButton}
      onClick={handleAskAI}
      title="Ask AI to explain this code"
      aria-label="Ask AI to explain this code example"
    >
      <Icon name="sparkle" />
      <span>Ask AI</span>
    </button>
  );
};

export default ContextualizedAIButton;