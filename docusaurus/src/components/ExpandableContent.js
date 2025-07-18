import React, { useState, useRef } from 'react';

export default function ExpandableContent({ 
  children, 
  showMoreText = "Show more…",
  showLessText = "Show less",
  maxHeight = "200px"
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const buttonRef = useRef(null);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    
    // Si on ferme le contenu, scroll vers le bouton après un petit délai
    if (isExpanded) {
      setTimeout(() => {
        buttonRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 100);
    }
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
          ref={buttonRef}
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