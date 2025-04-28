import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Icon from '../../components/Icon.js';

export default function CustomSearchBarWrapper() {
  return (
    <BrowserOnly fallback={<div style={{ width: '100%', height: '40px' }} />}>
      {() => {
        const { useInkeepModal } = require('../../hooks/useInkeepModal');
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
      }}
    </BrowserOnly>
  );
}
