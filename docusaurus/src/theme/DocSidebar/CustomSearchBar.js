import React from 'react';
// import SearchBar from '@theme-original/SearchBar';
import Icon from '../../components/Icon.js'
import MyOramaSearchBoxComponent from '../../components/OramaSearchBox.js'; 

export default function CustomSearchBarWrapper(props) {
  return (
    <div className="my-custom-search-bar">
      {/* <SearchBar {...props} /> */}
      <MyOramaSearchBoxComponent />
      <button className="kapa-widget-button"><span className="kapa-widget-button-text"><Icon name="sparkle"/>Ask AI</span></button>
    </div>
  );
}
