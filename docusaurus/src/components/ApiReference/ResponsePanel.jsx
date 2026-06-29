import React, { useState } from 'react';
import CopyCodeButton from './CopyCodeButton';
import styles from './api-reference.module.scss';
import clsx from 'clsx';

/**
 * ResponsePanel with status tabs and animated dot.
 *
 * Usage:
 * <ResponsePanel responses={[
 *   { status: 200, statusText: 'OK', time: '23ms', body: `{ "data": [...] }` },
 *   { status: 400, statusText: 'Bad Request', body: `{ "error": {...} }` },
 * ]} />
 */
const COLLAPSE_LINE_THRESHOLD = 10;

export default function ResponsePanel({ kind = 'http', responses = [], collapsible = false }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [expanded, setExpanded] = useState(false);
  if (!responses.length) return null;

  const isJs = kind === 'js';
  const active = responses[activeIdx];
  const isOk = active.status < 400;

  // Opt-in: collapse long response bodies behind a "Show more" toggle.
  const lineCount = active.body ? String(active.body).split('\n').length : 0;
  const isCollapsible = collapsible && lineCount > COLLAPSE_LINE_THRESHOLD;
  const collapsed = isCollapsible && !expanded;

  const getTabStyle = (status) => {
    if (status < 300) return 'response-tab--2xx';
    if (status < 400) return 'response-tab--3xx';
    if (status < 500) return 'response-tab--4xx';
    return 'response-tab--5xx';
  };

  return (
    <div className={styles.responsePanel}>
      {!isJs && responses.length > 1 && (
        <div className={styles.responseTabs}>
          {responses.map((r, i) => (
            <span
              key={i}
              className={clsx(
                styles.responseTab,
                styles[getTabStyle(r.status)],
                i === activeIdx && styles['responseTab--active']
              )}
              onClick={() => setActiveIdx(i)}
            >
              {r.status}
            </span>
          ))}
        </div>
      )}

      <div className={styles.responseHeader}>
        {isJs ? (
          <span className={clsx(styles.responseStatus, styles['responseStatus--ok'])}>
            Returns
          </span>
        ) : (
          <>
            <span className={clsx(styles.responseDot, isOk ? styles['responseDot--ok'] : styles['responseDot--err'])} />
            <span className={clsx(styles.responseStatus, isOk ? styles['responseStatus--ok'] : styles['responseStatus--err'])}>
              {active.status} {active.statusText}
            </span>
            {active.time && <span className={styles.responseTime}>{active.time}</span>}
          </>
        )}
      </div>

      <div className={styles.codePanel}>
        <div className={styles.codePanel__codeWrap}>
          <CopyCodeButton code={active.body} />
          <pre
            className={clsx(
              styles.codePanel__pre,
              collapsed && styles['codePanel__pre--collapsed'],
            )}
          >
            <code>{active.body}</code>
          </pre>
          {collapsed && <div className={styles.codePanel__fade} aria-hidden="true" />}
        </div>
        {isCollapsible && (
          <button
            type="button"
            className={styles.codePanel__showMore}
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
    </div>
  );
}
