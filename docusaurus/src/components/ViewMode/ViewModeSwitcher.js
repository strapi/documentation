import React, { useState, useEffect, useCallback } from 'react';
import { useViewMode } from './ViewModeContext';
import WidthToggle from '@site/src/components/WidthToggle/WidthToggle';
import styles from './viewModeSwitcher.module.scss';

const MODES = [
  { value: 'elegant', label: 'Elegant Mode', icon: 'sparkle' },
  { value: 'markdown', label: 'Markdown Mode', icon: 'code' },
  { value: 'ai', label: 'AI Mode', icon: 'robot' },
];

export default function ViewModeSwitcher() {
  const { viewMode, setViewMode } = useViewMode();

  // The active-tab highlight is decided client-side only. The component is
  // server-rendered with viewMode='elegant', and React keeps that SSR markup on
  // hydration even once the state is corrected — which left "Elegant" stuck as
  // active while the page was actually in markdown (e.g. after breadcrumb nav).
  // Gating the highlight on a post-mount flag forces it to reflect the real
  // viewMode after hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const handleKeyDown = useCallback((e) => {
    const currentIndex = MODES.findIndex((m) => m.value === viewMode);
    let nextIndex;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % MODES.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + MODES.length) % MODES.length;
    } else {
      return;
    }
    setViewMode(MODES[nextIndex].value);
  }, [viewMode, setViewMode]);

  return (
    <div className={styles.switcher}>
      <div
        className={styles.modes}
        role="radiogroup"
        aria-label="View mode"
        onKeyDown={handleKeyDown}
      >
        {MODES.map((m) => {
          const isActive = mounted && viewMode === m.value;
          return (
            <button
              key={m.value}
              className={`${styles.button} ${isActive ? styles.active : ''}`}
              role="radio"
              aria-checked={isActive}
              aria-label={m.label}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setViewMode(m.value)}
            >
              <i className={`ph-bold ph-${m.icon}`} />
              {m.label}
            </button>
          );
        })}
      </div>
      <WidthToggle />
    </div>
  );
}
