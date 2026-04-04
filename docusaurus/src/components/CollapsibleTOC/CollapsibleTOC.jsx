import React, { useState, useEffect, useCallback } from 'react';
import styles from './CollapsibleTOC.module.scss';

const STORAGE_KEY = 'strapi-toc-collapsed';

export default function CollapsibleTOC({ children }) {
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
    <div className={`${styles.wrapper} toc-v3-wrapper ${collapsed ? `${styles.collapsed} toc-v3-wrapper--collapsed` : ''}`}>
      <div className={styles.header}>
        <span className={styles.label}>On this page</span>
        <button
          className={styles.headerToggle}
          onClick={toggle}
          aria-label={collapsed ? 'Expand table of contents' : 'Collapse table of contents'}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '◀' : '▶'}
        </button>
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
