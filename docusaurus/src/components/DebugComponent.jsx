// Temporary component for testing during development
// Just import and use: <DebugComponent test="ai-toolbar" />

import React, { useEffect } from 'react';

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
    
    // Add other tests here as needed
    // if (test === 'other-feature') { ... }
    
  }, [test]);

  // Return null to not affect the UI
  return null;
};

export default DebugComponent;