import React, { useState, useEffect, useCallback } from 'react';
import styles from './StepProgress.module.scss';

/**
 * Floating progress widget for pages that use <StepDetails>.
 * - Discovers steps from the DOM (elements with [data-step-details]).
 * - Reads completion from the data-step-completed attribute kept in sync by
 *   StepDetails, and refreshes on the 'strapi-steps-changed' event it emits.
 * - Renders nothing when the page has no steps.
 */
export default function StepProgress() {
  const [steps, setSteps] = useState([]);
  const [expanded, setExpanded] = useState(false);

  const readSteps = useCallback(() => {
    if (typeof document === 'undefined') return [];
    // Titles/order come from the DOM; completion comes from sessionStorage, which
    // StepDetails writes BEFORE emitting 'strapi-steps-changed'. Reading the
    // data-step-completed attribute instead would race the React re-render.
    let completedList = [];
    try {
      const all = JSON.parse(sessionStorage.getItem('strapi-docs-completed-steps') || '{}');
      completedList = all[window.location.pathname] || [];
    } catch {}
    return [...document.querySelectorAll('[data-step-details]')].map((el) => ({
      id: el.id,
      title: el.getAttribute('data-step-title') || el.id,
      completed: completedList.includes(el.id),
    }));
  }, []);

  useEffect(() => {
    // Initial read (after StepDetails have mounted) + on every change.
    const refresh = () => setSteps(readSteps());
    refresh();
    // A short delayed re-read covers the first client render of StepDetails.
    const t = setTimeout(refresh, 300);
    window.addEventListener('strapi-steps-changed', refresh);
    return () => {
      clearTimeout(t);
      window.removeEventListener('strapi-steps-changed', refresh);
    };
  }, [readSteps]);

  if (steps.length === 0) return null;

  const done = steps.filter((s) => s.completed).length;
  const total = steps.length;
  const pct = Math.round((done / total) * 100);
  const allDone = done === total;

  const scrollToStep = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.open = true;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={`${styles.widget} ${expanded ? styles.expanded : ''} ${allDone ? styles.complete : ''}`}>
      <button
        type="button"
        className={styles.header}
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label={expanded ? 'Collapse progress' : 'Expand progress'}
      >
        <span className={styles.label}>
          {allDone ? (
            <>
              <i className="ph ph-check-circle" /> All steps completed
            </>
          ) : (
            <>Progress: {done}/{total} steps</>
          )}
        </span>
        <i className={`ph ph-caret-${expanded ? 'down' : 'up'} ${styles.caret}`} />
      </button>

      <div className={styles.bar}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>

      {expanded && (
        <ul className={styles.list}>
          {steps.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={`${styles.item} ${s.completed ? styles.itemDone : ''}`}
                onClick={() => scrollToStep(s.id)}
                title={s.title}
              >
                <i className={`ph ph-${s.completed ? 'check-circle' : 'circle'}`} />
                <span className={styles.itemTitle}>{s.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
