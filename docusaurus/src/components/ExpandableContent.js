import React, { useState, useRef } from 'react';

export default function ExpandableContent({ 
  children, 
  showMoreText = "Show more…",
  showLessText = "Show less",
  maxHeight = "200px"
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const buttonRef = useRef(null);

  const toggleExpanded = () => {
    // Mark as interacted so the max-height transition is enabled only from the
    // first user toggle on (avoids the open-then-collapse flash on page reload).
    setInteracted(true);
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
    <div className="expandable-content" data-interacted={interacted ? 'true' : undefined}>
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