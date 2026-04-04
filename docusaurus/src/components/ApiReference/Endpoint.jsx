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
  const hasColumns = (params.length > 0 || children) && (codeTabs.length > 0 || responses.length > 0);

  return (
    <div className={`${styles.endpoint} api-endpoint-block`} id={id} style={isLast ? { borderBottom: 'none' } : undefined}>
      {/* Header: full-width, above the 2-column grid */}
      <div className={styles.endpoint__header}>
        <div className={styles.endpoint__methodRow}>
          <MethodPill method={method} />
          <span className={styles.endpoint__path}>
            {path}
          </span>
        </div>
        {description && <p className={styles.endpoint__text}>{description}</p>}
      </div>

      {/* 2-column grid: params left, code right */}
      {hasColumns ? (
        <div className={styles.endpoint__columns}>
          <div className={styles.endpoint__desc}>
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
      ) : (
        /* Fallback: no params, just code below the header */
        <>
          {(codeTabs.length > 0 || responses.length > 0) && (
            <div className={styles.endpoint__codeOnly}>
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
          )}
          {children && <div className={styles.endpoint__desc}>{children}</div>}
        </>
      )}
    </div>
  );
}
