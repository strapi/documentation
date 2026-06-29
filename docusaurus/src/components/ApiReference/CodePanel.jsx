import React, { useState } from 'react';
import CopyCodeButton from './CopyCodeButton';
import styles from './api-reference.module.scss';
import clsx from 'clsx';

/**
 * CodePanel with language tabs and URL bar.
 *
 * Usage:
 * <CodePanel
 *   method="GET"
 *   path="/api/restaurants?populate=*"
 *   pathHighlights={['restaurants']}
 *   tabs={[
 *     { label: 'cURL', language: 'bash', code: `curl 'http://localhost:1337/api/restaurants' ...` },
 *     { label: 'JavaScript', language: 'javascript', code: `const res = await fetch(...)` },
 *   ]}
 * />
 */
export default function CodePanel({ kind = 'http', method = 'GET', path, pathHighlights = [], tabs = [] }) {
  const [activeTab, setActiveTab] = useState(0);
  const methodKey = method.toUpperCase() === 'DELETE' ? 'del' : method.toLowerCase();
  const displayMethod = method.toUpperCase() === 'DELETE' ? 'DEL' : method.toUpperCase();
  const isJs = kind === 'js';

  // Highlight path params
  const renderPath = (p) => {
    if (!p) return null;
    let result = p;
    pathHighlights.forEach(h => {
      result = result.replace(h, `<span class="${styles.pathHighlight}">${h}</span>`);
    });
    // Also highlight :param patterns
    result = result.replace(/:(\w+)/g, `<span class="${styles.pathHighlight}">:$1</span>`);
    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  };

  return (
    <div className={styles.codePanel}>
      {tabs.length > 1 && (
        <div className={styles.codePanel__tabs}>
          {tabs.map((tab, i) => (
            <span
              key={i}
              className={clsx(styles.codePanel__tab, i === activeTab && styles['codePanel__tab--active'])}
              onClick={() => setActiveTab(i)}
            >
              {tab.label}
            </span>
          ))}
        </div>
      )}
      {path && !isJs && (
        <div className={styles.codePanel__url}>
          <span className={clsx(styles.codePanel__urlMethod, styles[`codePanel__urlMethod--${methodKey}`])}>
            {displayMethod}
          </span>
          <span className={styles.codePanel__urlPath}>{renderPath(path)}</span>
        </div>
      )}
      <div className={styles.codePanel__codeWrap}>
        <CopyCodeButton code={tabs[activeTab]?.code || ''} />
        <pre className={styles.codePanel__pre}>
          <code>{tabs[activeTab]?.code || ''}</code>
        </pre>
      </div>
    </div>
  );
}
