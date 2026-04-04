import React from 'react';
import styles from './api-reference.module.scss';

/**
 * API page header with gradient accent bar.
 *
 * <ApiHeader
 *   title="REST API — Entries"
 *   description="CRUD operations on content-type entries."
 *   baseUrl="http://localhost:1337"
 * />
 */
export default function ApiHeader({ title, description, baseUrl = 'http://localhost:1337' }) {
  return (
    <div className={styles.apiHeader}>
      <h1 className={styles.apiHeader__title}>{title}</h1>
      {description && <p className={styles.apiHeader__desc}>{description}</p>}
      <div className={styles.apiHeader__base}>
        <span className={styles.apiHeader__baseLabel}>Base</span>
        <span className={styles.apiHeader__baseUrl}>{baseUrl}</span>
      </div>
    </div>
  );
}
