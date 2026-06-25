import React, { useState, useRef, useEffect } from 'react';
import { getPrimaryAction, getDropdownActions } from './utils/aiToolsHelpers';
import { executeAction, getActionDisplay } from './actions/actionRegistry';
import Icon from '../Icon';

const AiToolbar = () => {
  const [actionStates, setActionStates] = useState({
    'copy-markdown': 'idle'
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState('elegant');
  const dropdownRef = useRef(null);

  // Track the active view mode (read from the DOM + the view-mode-change event,
  // to avoid depending on the React context being an ancestor here).
  useEffect(() => {
    const read = () =>
      setViewMode(document.documentElement.dataset.viewMode || 'elegant');
    read();
    const onChange = (e) =>
      setViewMode((e.detail && e.detail.mode) || document.documentElement.dataset.viewMode || 'elegant');
    window.addEventListener('view-mode-change', onChange);
    return () => window.removeEventListener('view-mode-change', onChange);
  }, []);

  const primaryAction = getPrimaryAction();
  // "View as Markdown" appears in exactly one place at a time:
  // - in elegant/AI modes: as a dropdown entry in the toolbar;
  // - in markdown mode: as the standalone button to the right of the toolbar
  //   (and removed from the dropdown to avoid duplication).
  const viewMarkdownAction = getDropdownActions().find((a) => a.id === 'view-markdown');
  const isMarkdownMode = viewMode === 'markdown';
  const dropdownActions = getDropdownActions().filter((a) => {
    if (a.id === 'view-markdown' && isMarkdownMode) return false;
    return true;
  });

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

  // Standalone "View as Markdown" button (right side of the toolbar).
  const handleViewMarkdown = async () => {
    if (!viewMarkdownAction) return;
    await executeAction(viewMarkdownAction, { closeDropdown });
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
                className={`ai-toolbar__dropdown-item ${action.description ? '' : 'ai-toolbar__dropdown-item--no-description'}`}
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

      {/* Standalone "View this page as .md" button — shown ONLY in markdown
          mode (in other modes the action lives in the toolbar dropdown). Sits
          just to the right of the toolbar group. */}
      {viewMarkdownAction && isMarkdownMode && (
        <button
          onClick={handleViewMarkdown}
          className="ai-toolbar__view-md"
          title={viewMarkdownAction.description}
        >
          <Icon name="markdown-logo" classes="ph-bold" color="inherit" />
          <span className="ai-toolbar__button-text">View this page as .md</span>
        </button>
      )}
    </div>
  );
};

export default AiToolbar;
