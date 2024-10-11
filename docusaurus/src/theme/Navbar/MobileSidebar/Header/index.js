import React from 'react';
import Header from '@theme-original/Navbar/MobileSidebar/Header';
import CustomSearchBar from '../../../DocSidebar/CustomSearchBar';

export default function HeaderWrapper(props) {
  return (
    <>
      <Header {...props} />
      <ul className="custom-mobile-navbar">
        <li>
          <a className="custom-mobile-navbar__item mobile-navbar__cms-link" href="/dev-docs/intro"><i className="ph-fill ph-feather"></i>CMS</a>
        </li>
        <li>
          <a className="custom-mobile-navbar__item mobile-navbar__cloud-link" href="/cloud/intro"><i className="ph-fill ph-cloud"></i>Cloud</a>
        </li>
      </ul>
      <div className="custom-mobile-navbar__separator"></div>
      <CustomSearchBar />
    </>
  );
}
