import React, { useEffect, useRef, useCallback } from 'react';
import { useLocation } from '@docusaurus/router';
import styles from './ReadingProgressBar.module.scss';

export default function ReadingProgressBar() {
  const fillRef = useRef(null);
  const rafRef = useRef(null);
  const location = useLocation();

  // Only show on doc pages (not homepage)
  const isDocPage = location.pathname !== '/' && !location.pathname.startsWith('/home');

  const updateProgress = useCallback(() => {
    if (!fillRef.current) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) {
      fillRef.current.style.width = '0%';
      return;
    }
    const pct = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
    fillRef.current.style.width = `${pct}%`;
  }, []);

  useEffect(() => {
    if (!isDocPage) return;

    function onScroll() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateProgress);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // Also listen to resize (content may change height)
    window.addEventListener('resize', onScroll, { passive: true });
    // Initial calculation
    updateProgress();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isDocPage, location.pathname, updateProgress]);

  if (!isDocPage) return null;

  return (
    <div className={styles.progressBar}>
      <div ref={fillRef} className={styles.progressFill} style={{ width: '0%' }} />
    </div>
  );
}
