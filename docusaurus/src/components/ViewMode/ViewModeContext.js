import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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

  useEffect(() => {
    document.documentElement.dataset.viewMode = viewMode;
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
