import React from 'react';
import DocSidebar from '@theme-original/DocSidebar';
import CustomSearchBar from './CustomSearchBar';

export default function DocSidebarWrapper(props) {
  return (
    <>
      <CustomSearchBar {...props} />
      <DocSidebar {...props} />
    </>
  );
}
