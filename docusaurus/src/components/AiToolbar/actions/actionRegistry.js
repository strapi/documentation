import { copyMarkdownAction } from './copyMarkdown';
import { navigateAction } from './navigate';

// Central registry of all available actions
export const actionHandlers = {
  'copy-markdown': copyMarkdownAction,
  'navigate': navigateAction,
};

// Main function to execute an action
export const executeAction = async (actionConfig, additionalContext = {}) => {
  const handler = actionHandlers[actionConfig.actionType];
  
  if (!handler) {
    console.warn(`Unknown action type: ${actionConfig.actionType}`);
    return;
  }
  
  const context = {
    ...actionConfig, // url, etc.
    ...additionalContext, // docId, docPath, updateActionState, closeDropdown, etc.
  };
  
  try {
    await handler(context);
  } catch (error) {
    console.error(`Error executing action ${actionConfig.actionType}:`, error);
  }
};

// Utility to get display information based on action state
export const getActionDisplay = (actionId, currentState = 'idle') => {
  switch (actionId) {
    case 'copy-markdown':
      switch (currentState) {
        case 'loading':
          return {
            icon: 'circle-notch',
            iconClasses: 'ph-bold spinning',
            label: 'Copying...',
            className: 'ai-toolbar-button--loading'
          };
        case 'success':
          return {
            icon: 'check-circle',
            iconClasses: 'ph-fill',
            label: 'Copied!',
            className: 'ai-toolbar-button--success'
          };
        case 'error':
          return {
            icon: 'warning-circle',
            iconClasses: 'ph-fill',
            label: 'Copy failed',
            className: 'ai-toolbar-button--error'
          };
        default: // 'idle'
          return {
            icon: 'copy',
            iconClasses: 'ph-bold',
            label: 'Copy Markdown',
            className: 'ai-toolbar-button--idle'
          };
      }
    default:
      // For other actions, just return their base configuration
      return {
        icon: 'question',
        iconClasses: 'ph-bold',
        label: 'Unknown',
        className: 'ai-toolbar-button--idle'
      };
  }
};