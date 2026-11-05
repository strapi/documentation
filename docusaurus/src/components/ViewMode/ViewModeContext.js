import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'strapi-view-mode';
const VIEW_MODES = ['elegant', 'markdown', 'ai'];
// How long the AI panel stays open while the mascot waves goodbye
const GOODBYE_MS = 900;

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
  leavingAi: false,
});

export function ViewModeProvider({ children }) {
  // Initialize straight from storage so content-affecting components (cards,
  // details) get the correct mode on the very first client render — no flash.
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

  const [leavingAi, setLeavingAi] = useState(false);
  const goodbyeTimer = useRef(null);

  const applyViewMode = useCallback((mode) => {
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

  // Leaving AI mode waits for the mascot's goodbye wave, unless motion is reduced
  const setViewMode = useCallback((mode) => {
    if (!VIEW_MODES.includes(mode)) return;
    clearTimeout(goodbyeTimer.current);
    const leaving = viewModeRef.current === 'ai' && mode !== 'ai';
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!leaving || calm) {
      setLeavingAi(false);
      applyViewMode(mode);
      return;
    }
    setLeavingAi(true);
    goodbyeTimer.current = setTimeout(() => {
      setLeavingAi(false);
      applyViewMode(mode);
    }, GOODBYE_MS);
  }, [applyViewMode]);

  useEffect(() => () => clearTimeout(goodbyeTimer.current), []);

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode, leavingAi }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  return useContext(ViewModeContext);
}

export { VIEW_MODES, STORAGE_KEY };
