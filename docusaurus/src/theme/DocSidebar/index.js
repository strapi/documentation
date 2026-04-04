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
      <div className="sidebar-v3-content">
        <div className="sidebar-v3-header">
          <span className="sidebar-v3-header__label">Navigation</span>
          <button
            className="sidebar-v3-header__toggle"
            onClick={toggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '▶' : '◀'}
          </button>
        </div>
        <ProductSwitcher />
        <CustomSearchBarWrapper />
        <DocSidebar {...props} />
      </div>
    </div>
  );
}
