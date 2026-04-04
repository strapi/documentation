import React, { useState, useEffect, useCallback } from 'react';
import DocSidebar from '@theme-original/DocSidebar';

const STORAGE_KEY = 'strapi-sidebar-collapsed';

export default function DocSidebarWrapper(props) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
  });

  const toggle = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch {}
      // Notify the swizzled Sidebar layout component
      window.dispatchEvent(new CustomEvent('sidebar-v3-toggle', { detail: { collapsed: next } }));
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
        <DocSidebar {...props} />
      </div>
    </div>
  );
}
