import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'strapi-view-mode';
const VIEW_MODES = ['elegant', 'markdown', 'ai'];

function getInitialMode() {
  if (typeof window === 'undefined') return 'elegant';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored !== 'ai' && VIEW_MODES.includes(stored)) return stored;
    return 'elegant';
  } catch {
    return 'elegant';
  }
}

const ViewModeContext = createContext({
  viewMode: 'elegant',
  setViewMode: () => {},
});

export function ViewModeProvider({ children }) {
  const [viewMode, setViewModeState] = useState(getInitialMode);

  const viewModeRef = useRef(viewMode);
  viewModeRef.current = viewMode;

  useEffect(() => {
    document.documentElement.dataset.viewMode = viewMode;

    function forceOpenDetails() {
      document.querySelectorAll('article details:not([open])').forEach((el) => {
        el.setAttribute('open', '');
        el.dataset.forcedOpen = 'true';
      });
    }

    if (viewMode === 'markdown') {
      forceOpenDetails();

      // Watch for details that appear after initial render (lazy hydration)
      // AND for any details being collapsed again (open attribute removed),
      // so a force-opened block can never end up closed in markdown mode.
      const observer = new MutationObserver(() => {
        if (viewModeRef.current === 'markdown') {
          forceOpenDetails();
        }
      });
      const article = document.querySelector('article');
      if (article) {
        observer.observe(article, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['open'],
        });
      }
      return () => observer.disconnect();
    } else {
      document.querySelectorAll('article details[data-forced-open]').forEach((el) => {
        el.removeAttribute('open');
        delete el.dataset.forcedOpen;
      });
    }
  }, [viewMode]);

  const setViewMode = useCallback((mode) => {
    if (!VIEW_MODES.includes(mode)) return;
    setViewModeState(mode);
    document.documentElement.dataset.viewMode = mode;

    try {
      if (mode === 'ai') {
        // Don't touch storage for AI
      } else {
        localStorage.setItem(STORAGE_KEY, mode);
      }
    } catch {
      // localStorage unavailable
    }

    window.dispatchEvent(
      new CustomEvent('view-mode-change', { detail: { mode } })
    );
  }, []);

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  return useContext(ViewModeContext);
}

export { VIEW_MODES, STORAGE_KEY };
