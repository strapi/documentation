import React, { useState, useEffect, useCallback } from 'react';
import GithubSlugger from 'github-slugger';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import styles from './StepDetails.module.scss';

const STORAGE_KEY = 'strapi-docs-completed-steps';

function getCompletedSteps() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function persistCompleted(pageId, stepId, completed) {
  if (typeof window === 'undefined') return;
  try {
    const steps = getCompletedSteps();
    const list = steps[pageId] || [];
    if (completed) {
      if (!list.includes(stepId)) list.push(stepId);
    } else {
      const i = list.indexOf(stepId);
      if (i !== -1) list.splice(i, 1);
    }
    steps[pageId] = list;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(steps));
    // Notify the progress widget (the storage event does not fire in the same tab).
    window.dispatchEvent(new CustomEvent('strapi-steps-changed', { detail: { pageId } }));
  } catch {}
}

function isStepCompleted(pageId, stepId) {
  return getCompletedSteps()[pageId]?.includes(stepId) || false;
}

// Use the same slugger Docusaurus uses for heading anchors (github-slugger) so
// the id generated here matches the `#step-...` anchors that cross-page links
// expect. The static `slug()` is stateless/deterministic per title.
function slugify(text) {
  return GithubSlugger.slug(text);
}

export default function StepDetails({ title, children, defaultOpen = false }) {
  const stepId = slugify(title);
  // Register the id with Docusaurus so its broken-anchor checker knows this
  // anchor exists (it only tracks heading anchors otherwise, not custom ids).
  useBrokenLinks().collectAnchor(stepId);

  const [pageId, setPageId] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pid = window.location.pathname;
      setPageId(pid);
      setCompleted(isStepCompleted(pid, stepId));
    }
  }, [stepId]);

  // Manual toggle: clicking the checkmark marks/unmarks the step as completed.
  // It does not open/close the <details> (stopPropagation), and opening the
  // block no longer auto-completes it.
  const toggleCompleted = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const next = !completed;
      setCompleted(next);
      if (pageId) persistCompleted(pageId, stepId, next);
    },
    [completed, pageId, stepId]
  );

  return (
    <details
      id={stepId}
      className={`alert alert--info ${styles.stepDetails} ${completed ? styles.completed : ''}`}
      open={defaultOpen || undefined}
      data-step-details=""
      data-step-title={title}
      data-step-completed={completed ? 'true' : 'false'}
    >
      <summary>
        {title}
        <button
          type="button"
          className={`${styles.checkmark} ${completed ? styles.checkmarkVisible : ''}`}
          onClick={toggleCompleted}
          aria-pressed={completed}
          aria-label={completed ? 'Mark step as not completed' : 'Mark step as completed'}
          title={completed ? 'Completed — click to undo' : 'Click to mark as completed'}
        >
          {completed ? (
            <i className="ph ph-check-circle" />
          ) : (
            <i className="ph ph-circle" />
          )}
        </button>
      </summary>
      {children}
    </details>
  );
}
