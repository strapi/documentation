import React, { useState, useRef, useEffect } from 'react';
import { getPrimaryAction, getDropdownActions } from './utils/aiToolsHelpers';
import { executeAction, getActionDisplay } from './actions/actionRegistry';
import Icon from '../Icon';

const AiToolbar = () => {
  const [actionStates, setActionStates] = useState({
    'copy-markdown': 'idle'
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const itemsRef = useRef([]);

  const primaryAction = getPrimaryAction();
  const dropdownActions = getDropdownActions();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setFocusedIndex(-1);
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
    setIsDropdownOpen((open) => {
      const next = !open;
      if (!next) setFocusedIndex(-1);
      return next;
    });
  };

  const onDropdownKeyDown = (e) => {
    if (!isDropdownOpen && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      setIsDropdownOpen(true);
      setFocusedIndex(0);
      return;
    }
    if (!isDropdownOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsDropdownOpen(false);
      setFocusedIndex(-1);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, dropdownActions.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === 'Home') {
      e.preventDefault();
      setFocusedIndex(0);
      return;
    }
    if (e.key === 'End') {
      e.preventDefault();
      setFocusedIndex(dropdownActions.length - 1);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const idx = focusedIndex >= 0 ? focusedIndex : 0;
      const action = dropdownActions[idx];
      if (action) handleDropdownAction(action);
    }
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
          aria-label={displayConfig.label}
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
          aria-haspopup="menu"
          aria-expanded={isDropdownOpen}
          aria-controls="ai-toolbar-menu"
          onKeyDown={onDropdownKeyDown}
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
          <div className="ai-toolbar__dropdown" id="ai-toolbar-menu" role="menu" aria-label="AI options">
            {dropdownActions.map((action, idx) => (
              <button
                key={action.id}
                ref={(el) => (itemsRef.current[idx] = el)}
                onClick={() => handleDropdownAction(action)}
                className={`ai-toolbar__dropdown-item ${action.description ? '' : 'ai-toolbar__dropdown-item--no-description'}`}
                title={action.description}
                role="menuitem"
                tabIndex={focusedIndex === idx ? 0 : -1}
                aria-label={action.label}
                onFocus={() => setFocusedIndex(idx)}
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
