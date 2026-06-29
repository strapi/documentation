import React from 'react';
import styles from './api-reference.module.scss';
import clsx from 'clsx';

/**
 * Structured parameter table for API endpoints.
 *
 * Usage:
 * <ParamTable title="Query Parameters" params={[
 *   { name: 'sort', type: 'string | string[]', required: false, description: 'Sort by field. Use `field:asc` or `field:desc`' },
 * ]} />
 */
export default function ParamTable({ title = 'Parameters', params = [] }) {
  if (!params.length) return null;
  return (
    <div className={styles.params}>
      <div className={styles.params__header}>{title}</div>
      {params.map((param, i) => (
        <div key={i} className={styles.paramRow}>
          <div>
            <div className={styles.param__name}>{param.name}</div>
            {param.type && <div className={styles.param__type}>{param.type}</div>}
          </div>
          <span className={clsx(
            styles.param__badge,
            param.required ? styles['param__badge--req'] : styles['param__badge--opt']
          )}>
            {param.required ? 'required' : 'optional'}
          </span>
          <div className={styles.param__desc} dangerouslySetInnerHTML={{ __html: param.description }} />
        </div>
      ))}
    </div>
  );
}
