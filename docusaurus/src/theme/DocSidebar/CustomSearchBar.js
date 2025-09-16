import React from 'react';
import SearchBar from '../SearchBar/index.js';
import Icon from '../../components/Icon.js'

export default function CustomSearchBarWrapper(props) {
  return (
    <div className="my-custom-search-bar">
      <SearchBar {...props} />
      <button className="kapa-widget-button"><span className="kapa-widget-button-text"><Icon name="sparkle"/>Ask AI</span></button>
    </div>
  );
}
