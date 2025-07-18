import React, { useState } from 'react';

export default function ExpandableContent({ 
  children, 
  showMoreText = "Show more…",
  showLessText = "Show less",
  maxHeight = "200px"
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="expandable-content">
      <div 
        className={`expandable-content__wrapper ${!isExpanded ? 'expandable-content__wrapper--collapsed' : ''}`}
        style={{
          maxHeight: isExpanded ? 'none' : maxHeight,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {children}
        {!isExpanded && (
          <div className="expandable-content__gradient" />
        )}
      </div>
      
      <div className="expandable-content__toggle">
        <button 
          className="expandable-content__button"
          onClick={toggleExpanded}
          type="button"
        >
          {isExpanded ? showLessText : showMoreText}
        </button>
      </div>
    </div>
  );
}