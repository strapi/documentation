import React, { useCallback } from 'react';
import { useViewMode } from './ViewModeContext';
import styles from './viewModeSwitcher.module.scss';

const MODES = [
  { value: 'elegant', label: 'Elegant Mode', icon: 'sparkle' },
  { value: 'markdown', label: 'Markdown Mode', icon: 'code' },
  { value: 'ai', label: 'AI Mode', icon: 'robot' },
];

export default function ViewModeSwitcher() {
  const { viewMode, setViewMode } = useViewMode();

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
    <div
      className={styles.switcher}
      role="radiogroup"
      aria-label="View mode"
      onKeyDown={handleKeyDown}
    >
      {MODES.map((m) => {
        const isActive = viewMode === m.value;
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
  );
}
