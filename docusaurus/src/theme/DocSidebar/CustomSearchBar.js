import React, { useState, useCallback } from 'react';
import {
  InkeepModalSearch,
} from "@inkeep/cxkit-react";
import Icon from '../../components/Icon.js';

export default function CustomSearchBarWrapper(props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = useCallback((newOpen) => {
    setIsOpen(newOpen);
  }, []);

  const config = {
    baseSettings: {
      apiKey: "c43431665c4e336c02def65c6f90a1e0d943dfe8066dcf43", // Replace with your actual API key
      primaryBrandColor: "#4945FF", // Strapi primary color
    },
    modalSettings: {
      isOpen,
      onOpenChange: handleOpenChange,
    },
    searchSettings: {
      placeholder: "Search documentation...",
    },
  };

  const handleSearchClick = () => {
    setIsOpen(true);
  };

  return (
    <>
      <div className="my-custom-search-bar">
        {/* Custom Inkeep trigger that replaces SearchBar */}
        <div 
          className="DocSearch DocSearch-Button"
          onClick={handleSearchClick}
          role="button"
          tabIndex="0"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSearchClick();
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          <span className="DocSearch-Button-Container">
            <span className="DocSearch-Button-Placeholder">Search</span>
          </span>
        </div>
        
        {/* Keep existing Kapa AI button unchanged */}
        <button className="kapa-widget-button">
          <span className="kapa-widget-button-text">
            <Icon name="sparkle"/>Ask AI
          </span>
        </button>
      </div>

      {/* The Inkeep Modal Component - Search only */}
      <InkeepModalSearch {...config} />
    </>
  );
}