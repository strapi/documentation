import React, { useState } from 'react';
import Icon from './Icon';

export default function ExpandableDocCardsWrapper({ 
  children, 
  initialVisible = 4,
  seeMoreText = "See more...",
  seeLessText = "See less"
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const childArray = React.Children.toArray(children);
  const visibleChildren = isExpanded ? childArray : childArray.slice(0, initialVisible);
  const hasMoreItems = childArray.length > initialVisible;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="expandable-cards-wrapper">
      <div className="custom-cards-wrapper">
        {visibleChildren}
      </div>
      
      {hasMoreItems && (
        <div className="expandable-cards-toggle">
          <button 
            className="expandable-cards-button"
            onClick={toggleExpanded}
            type="button"
          >
            <Icon 
              name={isExpanded ? "caret-up" : "caret-down"} 
              classes={`ph-fill expandable-cards-icon ${isExpanded ? 'expandable-cards-icon--up' : 'expandable-cards-icon--down'}`}
            />
            {isExpanded ? seeLessText : seeMoreText}
          </button>
        </div>
      )}
    </div>
  );
}