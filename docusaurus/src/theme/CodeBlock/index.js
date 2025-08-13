import React, { useEffect, useRef } from 'react';
import CodeBlock from '@theme-original/CodeBlock';
import Icon from '../../components/Icon';

// Helper function to check if we should show the AI button
function shouldShowAIButton(codeContent) {
  if (!codeContent || typeof codeContent !== 'string') {
    return false;
  }

  const content = codeContent.trim();
  
  // Must be substantial content
  if (content.length <= 30) {
    return false;
  }

  // Must be multi-line OR contain code structures
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

  if (!hasCodeStructures) {
    return false;
  }

  // Exclude command line operations
  const excludePatterns = [
    'npm install', 'yarn add', 'yarn install', 'npm run', 'yarn run',
    'cd ', 'ls ', 'mkdir ', 'strapi generate', 'strapi develop', 
    'strapi build', 'strapi start'
  ];

  if (excludePatterns.some(pattern => content.includes(pattern))) {
    return false;
  }

  // Exclude simple file paths or configuration values
  if (content.match(/^[\/\w\-\.]+$/) || content.match(/^\w+:\s*\w+$/)) {
    return false;
  }

  return true;
}

// Function to create and inject AI button
function injectAIButton(codeBlockElement, codeContent, language) {
  // Find the button group or create injection point
  let buttonGroup = codeBlockElement.querySelector('[class*="buttonGroup"]');
  
  if (!buttonGroup) {
    // If no button group exists, create our own container
    const codeBlockContainer = codeBlockElement.querySelector('[class*="codeBlockContainer"]');
    if (!codeBlockContainer) return;

    buttonGroup = document.createElement('div');
    buttonGroup.className = 'ai-button-group';
    buttonGroup.style.cssText = `
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 10;
      opacity: 0;
      transition: opacity 0.2s ease;
      display: flex;
      gap: 4px;
    `;
    
    codeBlockContainer.style.position = 'relative';
    codeBlockContainer.appendChild(buttonGroup);
    
    // Show on hover
    const showButtons = () => buttonGroup.style.opacity = '1';
    const hideButtons = () => buttonGroup.style.opacity = '0';
    
    codeBlockElement.addEventListener('mouseenter', showButtons);
    codeBlockElement.addEventListener('mouseleave', hideButtons);
  }

  // Check if AI button already exists
  if (buttonGroup.querySelector('.ai-button')) {
    return;
  }

  // Create AI button
  const aiButton = document.createElement('button');
  aiButton.className = 'clean-btn ai-button';
  aiButton.title = 'Ask AI to explain this code';
  aiButton.setAttribute('aria-label', 'Ask AI to explain this code example');
  
  aiButton.style.cssText = `
    padding: 4px 8px;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 500;
    border: none;
    background: var(--ifm-color-emphasis-300);
    color: var(--ifm-color-content);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  `;

  // Create icon and text
  const icon = document.createElement('span');
  icon.innerHTML = '✨'; // Fallback if Icon component not available
  icon.style.cssText = 'font-size: 12px; line-height: 1;';
  
  const text = document.createElement('span');
  text.textContent = 'Ask AI';
  text.style.cssText = 'font-size: 11px; line-height: 1;';

  aiButton.appendChild(icon);
  aiButton.appendChild(text);

  // Add hover effect
  aiButton.addEventListener('mouseenter', () => {
    aiButton.style.background = 'var(--ifm-color-emphasis-400)';
    aiButton.style.color = 'var(--ifm-color-content-inverse)';
  });
  
  aiButton.addEventListener('mouseleave', () => {
    aiButton.style.background = 'var(--ifm-color-emphasis-300)';
    aiButton.style.color = 'var(--ifm-color-content)';
  });

  // Add click handler
  aiButton.addEventListener('click', () => {
    if (typeof window !== 'undefined' && window.Kapa) {
      const prompt = `Could you explain the code example below:

\`\`\`${language}
${codeContent}
\`\`\``;

      window.Kapa.open({
        query: prompt,
        submit: true
      });
    } else {
      console.warn('Kapa widget not available');
    }
  });

  // Add button to group
  buttonGroup.appendChild(aiButton);
}

export default function CodeBlockWrapper(props) {
  const { children, className = '', ...otherProps } = props;
  const codeBlockRef = useRef(null);
  
  // Extract code content and language
  let codeContent = '';
  if (typeof children === 'string') {
    codeContent = children;
  } else if (children?.props?.children) {
    codeContent = children.props.children;
  }
  
  // Extract language from className (format: "language-javascript")
  const languageMatch = className.match(/language-(\w+)/);
  const language = languageMatch ? languageMatch[1] : '';
  
  // Check if we should show the AI button
  const showAI = shouldShowAIButton(codeContent);

  // Inject AI button after component mounts
  useEffect(() => {
    if (showAI && codeBlockRef.current) {
      // Small delay to ensure Docusaurus has fully rendered
      const timer = setTimeout(() => {
        injectAIButton(codeBlockRef.current, codeContent.trim(), language);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [showAI, codeContent, language]);

  return (
    <div ref={codeBlockRef}>
      <CodeBlock className={className} {...otherProps}>
        {children}
      </CodeBlock>
    </div>
  );
}