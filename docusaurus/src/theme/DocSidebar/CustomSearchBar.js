import React from 'react';
import { useInkeepModal } from '../../hooks/useInkeepModal'; // adapte le chemin
import Icon from '../../components/Icon.js';

const CustomSearchBarWrapper = () => {
  const { openSearch, openChat, modal } = useInkeepModal();

  return (
    <>
      <div className="my-custom-search-bar">
        {/* Search Button */}
        <button onClick={openSearch} className="DocSearch DocSearch-Button">
          <span className="DocSearch-Button-Placeholder">Search</span>
        </button>

        {/* Ask AI Button */}
        <button onClick={openChat} className="kapa-widget-button">
          <span className="kapa-widget-button-text">
            <Icon name="sparkle" />
            Ask AI
          </span>
        </button>
      </div>

      {/* Modal */}
      {modal}
    </>
  );
};

export default CustomSearchBarWrapper;
