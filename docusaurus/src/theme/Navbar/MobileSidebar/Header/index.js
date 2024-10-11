import React from 'react';
import Header from '@theme-original/Navbar/MobileSidebar/Header';
import CustomSearchBar from '../../../DocSidebar/CustomSearchBar';

export default function HeaderWrapper(props) {
  return (
    <>
      <Header {...props} />
      <CustomSearchBar />
    </>
  );
}
