import React from 'react';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import styles from './api-reference.module.scss';
import MethodPill from './MethodPill';
import ParamTable from './ParamTable';
import CodePanel from './CodePanel';
import ResponsePanel from './ResponsePanel';

/**
 * Full 2-column endpoint block matching the V3 mockup.
 *
 * Usage (HTTP / REST):
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
 *
 * Usage (JS API — Document Service, etc.): pass kind="js". This hides the HTTP
 * method pill and the URL bar, renders `path` as the JS method signature, and
 * labels the result "Returns" instead of an HTTP status. A JS call has no HTTP
 * verb and no HTTP status, so the http chrome is suppressed.
 * <Endpoint
 *   kind="js"
 *   path="strapi.documents().findOne()"
 *   title="findOne()"
 *   description="Find a document matching the passed documentId..."
 *   params={[...]}
 *   codeTabs={[{ label: 'Request', code: '...' }]}
 *   responses={[{ body: '{ ... }' }]}
 * />
 */
export default function Endpoint({
  id,
  kind = 'http',
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
  collapsibleResponse = false,
  isLast = false,
  children,
}) {
  useBrokenLinks().collectAnchor(id);
  const hasColumns = (params.length > 0 || children) && (codeTabs.length > 0 || responses.length > 0);
  const isJs = kind === 'js';

  return (
    <div
      className={`${styles.endpoint} api-endpoint-block ${hasColumns ? 'api-endpoint-block--columns' : 'api-endpoint-block--codeonly'}`}
      id={id}
      style={isLast ? { borderBottom: 'none' } : undefined}
    >
      {/* Header: full-width, above the 2-column grid */}
      <div className={styles.endpoint__header}>
        <div className={styles.endpoint__methodRow}>
          {isJs ? (
            <code className={styles.endpoint__signature}>{path}</code>
          ) : (
            <>
              <MethodPill method={method} />
              <span className={styles.endpoint__path}>
                {path}
              </span>
            </>
          )}
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
                kind={kind}
                method={method}
                path={codePath || path}
                pathHighlights={codePathHighlights}
                tabs={codeTabs}
              />
            )}
            {responses.length > 0 && <ResponsePanel kind={kind} responses={responses} collapsible={collapsibleResponse} />}
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
              {responses.length > 0 && <ResponsePanel kind={kind} responses={responses} collapsible={collapsibleResponse} />}
            </div>
          )}
          {children && <div className={styles.endpoint__desc}>{children}</div>}
        </>
      )}
    </div>
  );
}
