import React, { useState, useCallback } from 'react';
import styles from './api-reference.module.scss';
import clsx from 'clsx';

/**
 * Self-contained copy button for the API reference code/response panels.
 *
 * The Docusaurus @theme/CodeBlock/CopyButton only renders correctly inside a
 * real <CodeBlock> (it depends on that component's CSS modules for sizing and
 * icons). Used standalone it collapses to a 0x0 element. This button owns its
 * own markup and styles, so it works anywhere.
 */
export default function CopyCodeButton({ code = '' }) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(() => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <button
      type="button"
      className={clsx(styles.copyCodeBtn, copied && styles['copyCodeBtn--copied'])}
      onClick={onCopy}
      aria-label={copied ? 'Copied' : 'Copy code to clipboard'}
      title={copied ? 'Copied!' : 'Copy'}
    >
      {copied ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}
