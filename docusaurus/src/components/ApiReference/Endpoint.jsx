import React from 'react';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import styles from './api-reference.module.scss';
import MethodPill from './MethodPill';
import ParamTable from './ParamTable';

/**
 * 2-column endpoint block.
 *
 * The component only owns what's specific to an API endpoint — the method pill,
 * the URL, the description, and the parameter table. The actual code (request
 * examples and responses) is passed as CHILDREN and rendered by the site's
 * standard Tabs + CodeBlock components, exactly like every other code block on
 * the site. This is why syntax highlighting and the copy / wrap / Ask AI
 * buttons are identical here: they *are* the standard code blocks.
 *
 * Authoring (see docs for full example):
 * <Endpoint method="GET" path="/api/:pluralApiId" title="…" description="…"
 *   params={[{ name, type, required, description }]}>
 *
 *   <Tabs>
 *     <TabItem value="curl" label="cURL">
 *       ```bash
 *       curl …
 *       ```
 *     </TabItem>
 *   </Tabs>
 *
 *   <Responses>
 *     <Response status={200}>
 *       ```json
 *       { … }
 *       ```
 *     </Response>
 *   </Responses>
 * </Endpoint>
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
  children,
}) {
  useBrokenLinks().collectAnchor(id);
  const isJs = kind === 'js';
  const hasParams = params.length > 0;

  return (
    <div
      className={`${styles.endpoint} api-endpoint-block ${hasParams ? 'api-endpoint-block--columns' : 'api-endpoint-block--codeonly'}`}
      id={id}
    >
      <div className={styles.endpoint__header}>
        <div className={styles.endpoint__methodRow}>
          {isJs ? (
            <code className={styles.endpoint__signature}>{path}</code>
          ) : (
            <>
              <MethodPill method={method} />
              <span className={styles.endpoint__path}>{path}</span>
            </>
          )}
        </div>
        {title && <p className={styles.endpoint__text}><strong>{title}</strong></p>}
        {description && <p className={styles.endpoint__text}>{description}</p>}
      </div>

      {hasParams ? (
        <div className={styles.endpoint__columns}>
          <div className={styles.endpoint__desc}>
            <ParamTable title={paramTitle} params={params} />
          </div>
          <div className={styles.endpoint__code}>{children}</div>
        </div>
      ) : (
        <div className={styles.endpoint__codeOnly}>{children}</div>
      )}
    </div>
  );
}
