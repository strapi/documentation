import React from 'react';
import DocSidebar from '@theme-original/DocSidebar';
import CustomSearchBarWrapper from './CustomSearchBar';

export default function DocSidebarWrapper(props) {
  return (
    <>
      <CustomSearchBarWrapper />
      <DocSidebar {...props} />
    </>
  );
}
