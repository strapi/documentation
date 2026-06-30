import React from 'react';

export default function CustomDocCardsWrapper({ children }) {
  // Same markup in every mode (no SSR/hydration DOM swap → no flash). Markdown
  // mode is styled entirely in CSS (view-modes.scss flattens this wrapper and
  // turns the cards into a bullet list).
  return (
    <div className="custom-cards-wrapper">
      {children}
    </div>
  );
}
