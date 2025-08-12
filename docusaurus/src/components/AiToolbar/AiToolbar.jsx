import React, { useState } from 'react';
import { getPrimaryAction } from './utils/aiToolsHelpers';
import { executeAction, getActionDisplay } from './actions/actionRegistry';
import Icon from '../Icon';

const AiToolbar = () => {
  const [actionStates, setActionStates] = useState({
    'copy-markdown': 'idle'
  });

  const primaryAction = getPrimaryAction();

  // Function to update action state
  const updateActionState = (actionId, state) => {
    setActionStates(prev => ({
      ...prev,
      [actionId]: state
    }));
  };

  // Handle primary action click
  const handlePrimaryAction = async () => {
    if (!primaryAction) {
      console.error('No primary action configured');
      return;
    }

    const context = {
      updateActionState,
      // Add any additional context needed
      docId: null, // Will be auto-detected by the action
      docPath: null, // Will be auto-detected by the action
    };

    await executeAction(primaryAction, context);
  };

  // Don't render if no primary action
  if (!primaryAction) {
    return null;
  }

  const currentState = actionStates[primaryAction.id] || 'idle';
  const displayConfig = getActionDisplay(primaryAction.id, currentState);
  const isDisabled = currentState === 'loading' || currentState === 'success';

  return (
    <div className="ai-toolbar">
      <button
        onClick={handlePrimaryAction}
        disabled={isDisabled}
        className={`ai-toolbar__button ${displayConfig.className}`}
        title={primaryAction.description}
      >
        <Icon 
          name={displayConfig.icon} 
          classes={displayConfig.iconClasses}
        />
        <span className="ai-toolbar__button-text">
          {displayConfig.label}
        </span>
        {/* Dropdown arrow - will be implemented in step 5 */}
        <Icon 
          name="caret-down" 
          classes="ph-bold ai-toolbar__dropdown-arrow" 
        />
      </button>
    </div>
  );
};

export default AiToolbar;