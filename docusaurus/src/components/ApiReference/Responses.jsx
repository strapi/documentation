import React, { Children, isValidElement } from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import clsx from 'clsx';
import ExpandableContent from '../ExpandableContent';
import styles from './api-reference.module.scss';

/**
 * Response block(s) for an endpoint.
 *
 * <Responses> renders the site's standard <Tabs> (one tab per status), so the
 * status switcher looks and behaves like every other tab set on the site — and
 * the code inside each tab is a standard CodeBlock (identical highlighting and
 * copy / wrap / Ask AI buttons). Inside each tab, a colored pulsing dot + label
 * (e.g. "200 OK") heads the response, then the code.
 *
 * <ResponseTab status={200} statusText="OK"> wraps one status' code fence.
 */

function dotClass(status) {
  return status < 400 ? styles['responseDot--ok'] : styles['responseDot--err'];
}
function labelClass(status) {
  return status < 400 ? styles['responseStatus--ok'] : styles['responseStatus--err'];
}

export function ResponseTab({ status, statusText = '', collapsible = false, children }) {
  const s = Number(status);
  return (
    <>
      <div className={styles.responseHeader}>
        <span className={clsx(styles.responseDot, dotClass(s))} />
        <span className={clsx(styles.responseStatus, labelClass(s))}>
          {s} {statusText}
        </span>
      </div>
      {collapsible ? (
        <ExpandableContent maxHeight="320px">{children}</ExpandableContent>
      ) : (
        children
      )}
    </>
  );
}

export default function Responses({ children }) {
  const items = Children.toArray(children).filter(
    (c) => isValidElement(c) && c.type === ResponseTab,
  );

  // Single response: no tabs needed, just render it.
  if (items.length <= 1) {
    return <div className={styles.responses}>{items}</div>;
  }

  return (
    <div className={styles.responses}>
      <Tabs>
        {items.map((item, i) => {
          const status = Number(item.props.status);
          return (
            <TabItem key={i} value={String(status)} label={String(status)}>
              {item}
            </TabItem>
          );
        })}
      </Tabs>
    </div>
  );
}
