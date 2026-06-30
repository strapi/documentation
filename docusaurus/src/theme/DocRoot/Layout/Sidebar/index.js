/**
 * Swizzled DocRoot/Layout/Sidebar — V3 smooth collapse
 *
 * Controls the <aside> width directly via inline style so that
 * CSS transitions work properly. The Docusaurus original uses a
 * CSS-module class + `var(--doc-sidebar-width)`, which can't be
 * overridden externally. By inlining the width, we get smooth
 * transitions when the sidebar-v3-wrapper toggles collapsed state.
 */
import React, {useState, useCallback, useEffect, useRef} from 'react';
import clsx from 'clsx';
import {prefersReducedMotion, ThemeClassNames} from '@docusaurus/theme-common';
import {useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import {useLocation} from '@docusaurus/router';
import DocSidebar from '@theme/DocSidebar';
import ExpandButton from '@theme-original/DocRoot/Layout/Sidebar/ExpandButton';
import styles from '@docusaurus/theme-classic/lib/theme/DocRoot/Layout/Sidebar/styles.module.css';

const STORAGE_KEY = 'strapi-sidebar-collapsed';
const EXPANDED_WIDTH = 280;
const COLLAPSED_WIDTH = 52;

function ResetOnSidebarChange({children}) {
  const sidebar = useDocsSidebar();
  return (
    <React.Fragment key={sidebar?.name ?? 'noSidebar'}>
      {children}
    </React.Fragment>
  );
}

export default function DocRootLayoutSidebar({
  sidebar,
  hiddenSidebarContainer,
  setHiddenSidebarContainer,
}) {
  const {pathname} = useLocation();
  const [hiddenSidebar, setHiddenSidebar] = useState(false);
  const asideRef = useRef(null);

  // V3: read collapsed state from our sidebar wrapper
  const [v3Collapsed, setV3Collapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
  });
  const [skipTransition, setSkipTransition] = useState(true);

  // Listen for v3 collapse/expand events
  useEffect(() => {
    const handler = (e) => {
      setV3Collapsed(e.detail.collapsed);
      setSkipTransition(false);
    };
    window.addEventListener('sidebar-v3-toggle', handler);
    return () => window.removeEventListener('sidebar-v3-toggle', handler);
  }, []);

  // Store sidebar state before AI mode forces collapse
  const preAiState = useRef(null);

  // Listen for view-mode-change events
  useEffect(() => {
    const handler = (e) => {
      const { mode } = e.detail;
      if (mode === 'ai') {
        // Save current state before collapsing
        preAiState.current = v3Collapsed;
        if (!v3Collapsed) {
          setV3Collapsed(true);
          setSkipTransition(false);
          try { localStorage.setItem(STORAGE_KEY, 'true'); } catch {}
        }
      } else if (preAiState.current !== null) {
        // Restore previous state
        setV3Collapsed(preAiState.current);
        setSkipTransition(false);
        try { localStorage.setItem(STORAGE_KEY, String(preAiState.current)); } catch {}
        preAiState.current = null;
      }
    };
    window.addEventListener('view-mode-change', handler);
    return () => window.removeEventListener('view-mode-change', handler);
  }, [v3Collapsed]);

  // Enable transitions after first paint, and drop the anti-FOUC attribute so
  // the head-script CSS stops forcing the collapsed look — from here React's
  // inline width drives the sidebar (so re-expanding is not blocked).
  useEffect(() => {
    try { delete document.documentElement.dataset.sidebarCollapsed; } catch {}
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSkipTransition(false);
      });
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    if (hiddenSidebar) {
      setHiddenSidebar(false);
    }
    if (!hiddenSidebar && prefersReducedMotion()) {
      setHiddenSidebar(true);
    }
    setHiddenSidebarContainer((value) => !value);
  }, [setHiddenSidebarContainer, hiddenSidebar]);

  const targetWidth = v3Collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  return (
    <aside
      ref={asideRef}
      className={clsx(
        ThemeClassNames.docs.docSidebarContainer,
        styles.docSidebarContainer,
        hiddenSidebarContainer && styles.docSidebarContainerHidden,
      )}
      style={{
        width: targetWidth,
        minWidth: targetWidth,
        transition: skipTransition
          ? 'none'
          : 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onTransitionEnd={(e) => {
        if (!e.currentTarget.classList.contains(styles.docSidebarContainer)) {
          return;
        }
        if (hiddenSidebarContainer) {
          setHiddenSidebar(true);
        }
      }}>
      <ResetOnSidebarChange>
        <div
          className={clsx(
            styles.sidebarViewport,
            hiddenSidebar && styles.sidebarViewportHidden,
          )}
          style={{
            top: 'var(--ifm-navbar-height, 3.75rem)',
            maxHeight: 'calc(100vh - var(--ifm-navbar-height, 3.75rem))',
          }}>
          <DocSidebar
            sidebar={sidebar}
            path={pathname}
            onCollapse={toggleSidebar}
            isHidden={hiddenSidebar}
          />
          {hiddenSidebar && <ExpandButton toggleSidebar={toggleSidebar} />}
        </div>
      </ResetOnSidebarChange>
    </aside>
  );
}
