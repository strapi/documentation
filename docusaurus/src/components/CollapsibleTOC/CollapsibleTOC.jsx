import React, { useState, useCallback, useEffect } from 'react';
import styles from './CollapsibleTOC.module.scss';

const STORAGE_KEY = 'strapi-toc-collapsed';

function getInitialCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export default function CollapsibleTOC({ children }) {
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);

  // Drop the anti-FOUC attribute once mounted so the head-script CSS stops
  // forcing the collapsed look — from here React's `collapsed` state drives the
  // TOC (so re-expanding is not blocked). The head script sets it before paint
  // to avoid a collapsed TOC flashing open on navigation.
  useEffect(() => {
    try { delete document.documentElement.dataset.tocCollapsed; } catch {}
  }, []);

  const toggle = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch {}
      return next;
    });
  }, []);

  return (
    <div className={`${styles.wrapper} toc-v3-wrapper ${collapsed ? `${styles.collapsed} toc-v3-wrapper--collapsed` : ''}`}>
      <div className={styles.header}>
        {!collapsed && <span className={styles.label}>On this page</span>}
        <button
          className={styles.toggle}
          onClick={toggle}
          aria-label={collapsed ? 'Show table of contents' : 'Hide table of contents'}
          title={collapsed ? 'Show table of contents' : 'Hide table of contents'}
        >
          {collapsed ? '◀' : '▶'}
        </button>
      </div>
      {!collapsed && (
        <div className={styles.content}>
          {children}
        </div>
      )}
    </div>
  );
}
