// Temporary component for testing during development
// Just import and use: <DebugComponent test="ai-toolbar" />

import React, { useEffect } from 'react';
import { AiToolbar } from './AiToolbar'; // Adjust path as needed

const DebugComponent = ({ test }) => {
  useEffect(() => {
    if (test === 'ai-toolbar') {
      console.log('🧪 Testing AIToolbar Configuration');
      
      try {
        // Dynamic import to avoid breaking if files don't exist yet
        import('./AiToolbar').then(({ getPrimaryAction, getDropdownActions, getConfig }) => {
          console.log('Primary action:', getPrimaryAction());
          console.log('Dropdown actions:', getDropdownActions());
          console.log('Full config:', getConfig());
          console.log('✅ AIToolbar config test completed');
        });
      } catch (error) {
        console.error('❌ AIToolbar test failed:', error);
      }
    }
    
    if (test === 'ai-actions') {
      console.log('🧪 Testing modular actions');
      
      try {
        import('./AiToolbar/actions/actionRegistry').then(({ executeAction, getActionDisplay, actionHandlers }) => {
          console.log('Available action handlers:', Object.keys(actionHandlers));
          console.log('Copy markdown display (idle):', getActionDisplay('copy-markdown', 'idle'));
          console.log('Copy markdown display (loading):', getActionDisplay('copy-markdown', 'loading'));
          console.log('✅ Modular actions test completed');
        });
      } catch (error) {
        console.error('❌ Actions test failed:', error);
      }
    }

    // Add other tests here as needed
    // if (test === 'other-feature') { ... }
    
  }, [test]);

  // Afficher le composant directement selon le test
  if (test === 'ai-toolbar-component') {
    return <AiToolbar />;
  }
  
  // Return null to not affect the UI
  return null;
};

export default DebugComponent;