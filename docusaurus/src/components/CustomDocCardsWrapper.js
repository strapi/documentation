import React from 'react';
import { useViewMode } from './ViewMode/ViewModeContext';

export default function CustomDocCardsWrapper({ children }) {
  const { viewMode } = useViewMode();

  // Markdown mode: render as a plain <ul>
  if (viewMode === 'markdown') {
    return (
      <ul style={{ paddingLeft: '24px', margin: '8px 0' }}>
        {children}
      </ul>
    );
  }

  return (
    <div className="custom-cards-wrapper">
      {children}
    </div>
  );
}
