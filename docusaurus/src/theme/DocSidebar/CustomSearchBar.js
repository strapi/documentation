import React from "react";
import SearchBar from '@theme-original/SearchBar';

export default function CustomSearchBar(props) {
  return (
    <div className="custom-search-bar">
      <SearchBar {...props} />
    </div>
  );
}
