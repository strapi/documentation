import React, { useState, useEffect, useCallback } from 'react';
import styles from './widthToggle.module.scss';

const STORAGE_KEY = 'strapi-content-width';
const WIDTHS = [
  { value: 'default', label: 'Default width', icon: 'arrows-in-line-horizontal' },
  { value: 'wide', label: 'Wide width', icon: 'arrows-out-line-horizontal' },
  { value: 'max', label: 'Full width', icon: 'arrows-out' },
];

const VALID = ['default', 'wide', 'max'];

function getStoredWidth() {
  if (typeof window === 'undefined') return 'default';
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return VALID.includes(v) ? v : 'default';
  } catch {
    return 'default';
  }
}

// The active width is read from the DOM (data-content-width on <html>), which
// is the single shared source of truth. Reading it here (rather than from a
// per-instance state seeded from localStorage) means every WidthToggle
// instance always reflects the same value, even if several are mounted at once
// or one is re-mounted on a layout change.
function getDomWidth() {
  if (typeof document === 'undefined') return 'default';
  const v = document.documentElement.dataset.contentWidth;
  return VALID.includes(v) ? v : 'default';
}

export default function WidthToggle() {
  // SSR renders 'default'; the real value is synced from the DOM after mount.
  const [width, setWidth] = useState('default');

  // On mount: apply the stored width to the DOM (if not already set), then keep
  // this instance's state in sync with the DOM attribute. A MutationObserver
  // means any change — from this instance, another instance, or elsewhere —
  // updates every toggle, so the active button is never stale.
  useEffect(() => {
    const stored = getStoredWidth();
    if (stored === 'default') {
      delete document.documentElement.dataset.contentWidth;
    } else {
      document.documentElement.dataset.contentWidth = stored;
    }
    setWidth(getDomWidth());

    const observer = new MutationObserver(() => setWidth(getDomWidth()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-content-width'],
    });
    return () => observer.disconnect();
  }, []);

  const handleChange = useCallback((value) => {
    // Write the shared source of truth; the MutationObserver above syncs the
    // state of this (and every other) toggle instance.
    if (value === 'default') {
      delete document.documentElement.dataset.contentWidth;
    } else {
      document.documentElement.dataset.contentWidth = value;
    }
    try {
      if (value === 'default') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, value);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const handleKeyDown = useCallback((e) => {
    const currentIndex = WIDTHS.findIndex((w) => w.value === width);
    let nextIndex;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % WIDTHS.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + WIDTHS.length) % WIDTHS.length;
    } else {
      return;
    }
    handleChange(WIDTHS[nextIndex].value);
  }, [width, handleChange]);

  return (
    <div
      className={styles.widthToggle}
      role="radiogroup"
      aria-label="Content width"
      onKeyDown={handleKeyDown}
    >
      {WIDTHS.map((w) => {
        const isActive = width === w.value;
        return (
          <button
            key={w.value}
            className={styles.button}
            role="radio"
            aria-checked={isActive}
            aria-label={w.label}
            title={w.label}
            tabIndex={isActive ? 0 : -1}
            onClick={() => handleChange(w.value)}
          >
            <i className={`ph-bold ph-${w.icon}`} />
          </button>
        );
      })}
    </div>
  );
}
