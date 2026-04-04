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
      <button
        className={styles.toggle}
        onClick={toggle}
        aria-label={collapsed ? 'Expand table of contents' : 'Collapse table of contents'}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d={collapsed
              ? 'M8.75 2.5L4.25 7L8.75 11.5'  // caret left (expand)
              : 'M5.25 2.5L9.75 7L5.25 11.5'    // caret right (collapse)
            }
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
