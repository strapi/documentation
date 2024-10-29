import React from 'react';
import Header from '@theme-original/Navbar/MobileSidebar/Header';
import CustomSearchBar from '../../../DocSidebar/CustomSearchBar';

export default function HeaderWrapper(props) {
  return (
    <>
      <Header {...props} />
      <ul className="custom-mobile-navbar">
        <li className="custom-mobile-navbar__item" >
          <a className="custom-mobile-navbar__item-link mobile-navbar__user-link" href="/user-docs/intro"><i className="ph-fill ph-feather"></i>User Guide</a>
        </li>
        <li className="custom-mobile-navbar__item" >
          <a className="custom-mobile-navbar__item-link mobile-navbar__dev-link" href="/dev-docs/intro"><i className="ph-fill ph-computer-tower"></i>Dev Docs</a>
        </li>
        <li className="custom-mobile-navbar__item" >
          <a className="custom-mobile-navbar__item-link mobile-navbar__cloud-link" href="/cloud/intro"><i className="ph-fill ph-cloud"></i>Cloud</a>
        </li>
      </ul>
      <div className="custom-mobile-navbar__separator"></div>
      <CustomSearchBar />
    </>
  );
}
