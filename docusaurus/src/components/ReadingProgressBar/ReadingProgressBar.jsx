import React, { useEffect, useState } from 'react';
import { useLocation } from '@docusaurus/router';
import styles from './ReadingProgressBar.module.scss';

export default function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);
  const location = useLocation();

  // Only show on doc pages (not homepage)
  const isDocPage = location.pathname !== '/' && !location.pathname.startsWith('/home');

  useEffect(() => {
    if (!isDocPage) return;

    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setProgress(0);
        return;
      }
      const pct = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      setProgress(pct);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDocPage, location.pathname]);

  if (!isDocPage) return null;

  return (
    <div className={styles.progressBar} role="progressbar" aria-valuenow={Math.round(progress)}>
      <div
        className={styles.progressFill}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
