import React from 'react';
import styles from './api-reference.module.scss';
import MethodPill from './MethodPill';
import ParamTable from './ParamTable';
import CodePanel from './CodePanel';
import ResponsePanel from './ResponsePanel';

/**
 * Full 2-column endpoint block matching the V3 mockup.
 *
 * Usage:
 * <Endpoint
 *   method="GET"
 *   path="/api/:pluralApiId"
 *   title="List entries"
 *   description="Returns a paginated list of entries..."
 *   params={[{ name: 'sort', type: 'string', required: false, description: '...' }]}
 *   paramTitle="Query Parameters"
 *   codeTabs={[{ label: 'cURL', code: '...' }, { label: 'JavaScript', code: '...' }]}
 *   codePath="/api/restaurants?populate=*"
 *   responses={[{ status: 200, statusText: 'OK', time: '23ms', body: '...' }]}
 * />
 */
export default function Endpoint({
  id,
  method = 'GET',
  path,
  title,
  description,
  params = [],
  paramTitle = 'Parameters',
  codeTabs = [],
  codePath,
  codePathHighlights = [],
  responses = [],
  isLast = false,
  children,
}) {
  return (
    <div className={`${styles.endpoint} api-endpoint-block`} id={id} style={isLast ? { borderBottom: 'none' } : undefined}>
      <div className={styles.endpoint__desc}>
        <div className={styles.endpoint__methodRow}>
          <MethodPill method={method} />
          <span className={styles.endpoint__path}>
            {path}
          </span>
        </div>
        <h2 className={styles.endpoint__title}>{title}</h2>
        {description && <p className={styles.endpoint__text}>{description}</p>}
        {params.length > 0 && <ParamTable title={paramTitle} params={params} />}
        {children}
      </div>
      <div className={styles.endpoint__code}>
        {codeTabs.length > 0 && (
          <CodePanel
            method={method}
            path={codePath || path}
            pathHighlights={codePathHighlights}
            tabs={codeTabs}
          />
        )}
        {responses.length > 0 && <ResponsePanel responses={responses} />}
      </div>
    </div>
  );
}
