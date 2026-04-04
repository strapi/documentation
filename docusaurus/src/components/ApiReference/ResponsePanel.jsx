import React, { useState } from 'react';
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
export default function ResponsePanel({ responses = [] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  if (!responses.length) return null;

  const active = responses[activeIdx];
  const isOk = active.status < 400;

  const getTabStyle = (status) => {
    if (status < 300) return 'response-tab--2xx';
    if (status < 400) return 'response-tab--3xx';
    if (status < 500) return 'response-tab--4xx';
    return 'response-tab--5xx';
  };

  return (
    <div className={styles.responsePanel}>
      {responses.length > 1 && (
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
        <span className={clsx(styles.responseDot, isOk ? styles['responseDot--ok'] : styles['responseDot--err'])} />
        <span className={clsx(styles.responseStatus, isOk ? styles['responseStatus--ok'] : styles['responseStatus--err'])}>
          {active.status} {active.statusText}
        </span>
        {active.time && <span className={styles.responseTime}>{active.time}</span>}
      </div>

      <div className={styles.codePanel}>
        <pre className={styles.codePanel__pre}>
          <code>{active.body}</code>
        </pre>
      </div>
    </div>
  );
}
