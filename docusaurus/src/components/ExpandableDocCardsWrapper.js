import React, { useState, useEffect } from 'react';
import Icon from './Icon';

export default function ExpandableDocCardsWrapper({
  children,
  initialVisible = 4,
  seeMoreText = "See more...",
  seeLessText = "See less"
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  // Markdown view mode shows everything: reveal all cards and hide the toggle.
  // Done in an effect (post-hydration) to avoid an SSR/client mismatch, since
  // the server always renders the elegant default.
  const [forceAll, setForceAll] = useState(false);

  useEffect(() => {
    const sync = () => setForceAll(document.documentElement.dataset.viewMode === 'markdown');
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-view-mode'] });
    return () => observer.disconnect();
  }, []);

  const childArray = React.Children.toArray(children);
  const showAll = isExpanded || forceAll;
  const visibleChildren = showAll ? childArray : childArray.slice(0, initialVisible);
  const hasMoreItems = childArray.length > initialVisible;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="expandable-cards-wrapper">
      <div className="custom-cards-wrapper">
        {visibleChildren}
      </div>

      {hasMoreItems && !forceAll && (
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