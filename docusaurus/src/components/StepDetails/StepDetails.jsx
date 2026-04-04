import React, { useState, useEffect, useCallback } from 'react';
import styles from './StepDetails.module.scss';

const STORAGE_KEY = 'strapi-docs-completed-steps';

function getCompletedSteps() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function setStepCompleted(pageId, stepId) {
  if (typeof window === 'undefined') return;
  try {
    const steps = getCompletedSteps();
    if (!steps[pageId]) steps[pageId] = [];
    if (!steps[pageId].includes(stepId)) {
      steps[pageId].push(stepId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(steps));
    }
  } catch {}
}

function isStepCompleted(pageId, stepId) {
  const steps = getCompletedSteps();
  return steps[pageId]?.includes(stepId) || false;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function StepDetails({ title, children }) {
  const stepId = slugify(title);
  const [pageId, setPageId] = useState('');
  const [completed, setCompleted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pid = window.location.pathname;
      setPageId(pid);
      setCompleted(isStepCompleted(pid, stepId));
    }
  }, [stepId]);

  const handleToggle = useCallback((e) => {
    const open = e.target.open;
    setIsOpen(open);

    // Mark as completed when opened (user has "read" it)
    if (open && pageId && !completed) {
      setStepCompleted(pageId, stepId);
      setCompleted(true);
    }
  }, [pageId, stepId, completed]);

  return (
    <details
      id={stepId}
      className={`${styles.stepDetails} ${completed ? styles.completed : ''}`}
      onToggle={handleToggle}
    >
      <summary>
        <span className={styles.titleText}>{title}</span>
        <span
          className={`${styles.checkmark} ${completed ? styles.checkmarkVisible : ''}`}
          title={completed ? 'Step completed' : 'Not yet completed'}
        >
          {completed ? (
            <i className="ph ph-check-circle" />
          ) : (
            <i className="ph ph-circle" />
          )}
        </span>
      </summary>
      {children}
    </details>
  );
}
