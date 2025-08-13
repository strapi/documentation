import React, { useState, useRef, useEffect } from 'react';
import { getPrimaryAction, getDropdownActions } from './utils/aiToolsHelpers';
import { executeAction, getActionDisplay } from './actions/actionRegistry';
import Icon from '../Icon';

const AiToolbar = () => {
  const [actionStates, setActionStates] = useState({
    'copy-markdown': 'idle'
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const primaryAction = getPrimaryAction();
  const dropdownActions = getDropdownActions();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to update action state
  const updateActionState = (actionId, state) => {
    setActionStates(prev => ({
      ...prev,
      [actionId]: state
    }));
  };

  // Function to close dropdown
  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  // Handle primary action click
  const handlePrimaryAction = async () => {
    if (!primaryAction) {
      console.error('No primary action configured');
      return;
    }

    const context = {
      updateActionState,
      closeDropdown,
      docId: null, // Will be auto-detected by the action
      docPath: null, // Will be auto-detected by the action
    };

    await executeAction(primaryAction, context);
  };

  // Handle dropdown action click
  const handleDropdownAction = async (action) => {
    const context = {
      updateActionState,
      closeDropdown,
      url: action.url, // For navigate actions
    };

    await executeAction(action, context);
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
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
      <div className="ai-toolbar__container" ref={dropdownRef}>
        <button
          onClick={handlePrimaryAction}
          disabled={isDisabled}
          className={`ai-toolbar__button ${displayConfig.className}`}
          title={primaryAction.description}
        >
          <Icon 
            name={displayConfig.icon} 
            classes={displayConfig.iconClasses}
            color={currentState === 'success' ? 'var(--strapi-success-700)' : 'inherit'}
          />
          <span className="ai-toolbar__button-text">
            {displayConfig.label}
          </span>
        </button>
        
        {/* Dropdown button */}
        <button
          onClick={toggleDropdown}
          className={`ai-toolbar__dropdown-trigger ${isDropdownOpen ? 'ai-toolbar__dropdown-trigger--open' : ''}`}
          title="More AI options"
          style={{
            borderColor: currentState === 'success' ? 'var(--strapi-neutral-200)' : undefined
          }}
        >
          <Icon 
            name="caret-down" 
            classes="ph-bold"
            color="inherit"
          />
        </button>

        {/* Dropdown menu */}
        {isDropdownOpen && (
          <div className="ai-toolbar__dropdown">
            {dropdownActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleDropdownAction(action)}
                className="ai-toolbar__dropdown-item"
                title={action.description}
              >
                <Icon 
                  name={action.icon} 
                  classes="ph-bold"
                  color="inherit"
                />
                <div className="ai-toolbar__dropdown-item-content">
                  <span className="ai-toolbar__dropdown-item-label">
                    {action.label}
                  </span>
                  {action.description && (
                    <span className="ai-toolbar__dropdown-item-description">
                      {action.description}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiToolbar;