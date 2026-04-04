import React, { useState, useEffect, useCallback } from 'react';
import DocSidebar from '@theme-original/DocSidebar';
import CustomSearchBarWrapper from './CustomSearchBar';
import ProductSwitcher from '../../components/ProductSwitcher/ProductSwitcher';

const STORAGE_KEY = 'strapi-sidebar-collapsed';

export default function DocSidebarWrapper(props) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'true') setCollapsed(true);
    } catch {}
  }, []);

  const toggle = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch {}
      return next;
    });
  }, []);

  return (
    <div
      className={`sidebar-v3-wrapper ${collapsed ? 'sidebar-v3-wrapper--collapsed' : ''}`}
    >
      <button
        className="sidebar-v3-toggle"
        onClick={toggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d={collapsed
              ? 'M5.25 2.5L9.75 7L5.25 11.5'  // caret right
              : 'M8.75 2.5L4.25 7L8.75 11.5'    // caret left
            }
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className="sidebar-v3-content">
        <ProductSwitcher />
        <CustomSearchBarWrapper />
        <DocSidebar {...props} />
      </div>
    </div>
  );
}
