import React from 'react';
import SearchBar from '@theme-original/SearchBar';
import Icon from '../../components/Icon.js'

export default function CustomSearchBarWrapper(props) {
  return (
    <div className="my-custom-search-bar">
      <button type="button" className="DocSearch DocSearch-Button" aria-label="Search">
        <span className="DocSearch-Button-Container">
          <svg width="20" height="20" className="DocSearch-Search-Icon" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z" stroke="currentColor" fill="none" fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round"></path></svg><span className="DocSearch-Button-Placeholder">Search</span></span><span className="DocSearch-Button-Keys"><kbd className="DocSearch-Button-Key">⌘</kbd><kbd className="DocSearch-Button-Key">K</kbd></span></button>
      <button className="kapa-widget-button"><span className="kapa-widget-button-text"><Icon name="sparkle"/>Ask AI</span></button>
    </div>
  );
}
