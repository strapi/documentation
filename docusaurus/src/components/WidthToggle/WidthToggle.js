import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './widthToggle.module.scss';

const STORAGE_KEY = 'strapi-content-width';
const SCROLL_THRESHOLD = 50;
const WIDTHS = [
  { value: 'default', label: 'Default width', icon: 'arrows-in-line-horizontal' },
  { value: 'wide', label: 'Wide width', icon: 'arrows-out-line-horizontal' },
  { value: 'max', label: 'Full width', icon: 'arrows-out' },
];

function getInitialWidth() {
  if (typeof window === 'undefined') return 'default';
  try {
    return localStorage.getItem(STORAGE_KEY) || 'default';
  } catch {
    return 'default';
  }
}

export default function WidthToggle() {
  const [width, setWidth] = useState(getInitialWidth);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Auto-hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < SCROLL_THRESHOLD) {
        setVisible(true);
      } else if (currentY > lastScrollY.current) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync DOM attribute on mount and changes
  useEffect(() => {
    if (width === 'default') {
      delete document.documentElement.dataset.contentWidth;
    } else {
      document.documentElement.dataset.contentWidth = width;
    }
  }, [width]);

  const handleChange = useCallback((value) => {
    setWidth(value);
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
      className={`${styles.widthToggle} ${visible ? '' : styles.hidden}`}
      role="radiogroup"
      aria-label="Content width"
      onKeyDown={handleKeyDown}
    >
      {WIDTHS.map((w) => {
        const isActive = width === w.value;
        return (
          <button
            key={w.value}
            className={`${styles.button} ${isActive ? styles.active : ''}`}
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
