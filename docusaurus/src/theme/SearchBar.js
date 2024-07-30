import React from 'react';
import SearchBar from '@theme-original/SearchBar';
import AskAiIcon from './AskAiIcon';

export default function SearchBarWrapper(props) {
  return (
    <div className="my-custom-search-bar">
      <SearchBar {...props} />
      <button className="kapa-widget-button"><span className="kapa-widget-button-text">Ask AI</span><AskAiIcon /></button>
    </div>
  );
}
