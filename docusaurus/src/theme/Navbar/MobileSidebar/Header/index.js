import React from 'react';
import Header from '@theme-original/Navbar/MobileSidebar/Header';
import CustomSearchBar from '../../../DocSidebar/CustomSearchBar';

export default function HeaderWrapper(props) {
  return (
    <>
      <Header {...props} />
      <a className="custom-mobile-navbar__item" href="/dev-docs/intro"><i className="ph-fill ph-feather"></i>CMS</a>
      <a className="custom-mobile-navbar__item" href="/cloud/intro"><i className="ph-fill ph-cloud"></i>Cloud</a>
      <CustomSearchBar />
    </>
  );
}
