import React, { useState, useEffect, useCallback, useRef } from 'react';
import DocSidebar from '@theme-original/DocSidebar';

const STORAGE_KEY = 'strapi-sidebar-collapsed';

export default function DocSidebarWrapper(props) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
  });
  const [aiMode, setAiMode] = useState(false);
  const preAiCollapsed = useRef(null);

  const toggle = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch {}
      window.dispatchEvent(new CustomEvent('sidebar-v3-toggle', { detail: { collapsed: next } }));
      return next;
    });
  }, []);

  // Listen for view-mode-change to force collapse in AI mode
  useEffect(() => {
    const handler = (e) => {
      const { mode } = e.detail;
      if (mode === 'ai') {
        setAiMode(true);
        preAiCollapsed.current = collapsed;
        if (!collapsed) {
          setCollapsed(true);
          try { localStorage.setItem(STORAGE_KEY, 'true'); } catch {}
          window.dispatchEvent(new CustomEvent('sidebar-v3-toggle', { detail: { collapsed: true } }));
        }
      } else {
        setAiMode(false);
        if (preAiCollapsed.current !== null) {
          setCollapsed(preAiCollapsed.current);
          try { localStorage.setItem(STORAGE_KEY, String(preAiCollapsed.current)); } catch {}
          window.dispatchEvent(new CustomEvent('sidebar-v3-toggle', { detail: { collapsed: preAiCollapsed.current } }));
          preAiCollapsed.current = null;
        }
      }
    };
    window.addEventListener('view-mode-change', handler);
    return () => window.removeEventListener('view-mode-change', handler);
  }, [collapsed]);

  const showCollapsed = collapsed;

  return (
    <div
      className={`sidebar-v3-wrapper ${showCollapsed ? 'sidebar-v3-wrapper--collapsed' : ''}`}
    >
      <div className="sidebar-v3-content">
        <div className="sidebar-v3-header">
          <span className="sidebar-v3-header__label">Navigation</span>
          <button
            className="sidebar-v3-header__toggle"
            onClick={toggle}
            aria-label={showCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={showCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {showCollapsed ? '▶' : '◀'}
          </button>
        </div>
        <DocSidebar {...props} />
      </div>
    </div>
  );
}
