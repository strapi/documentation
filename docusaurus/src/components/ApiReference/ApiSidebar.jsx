import React from 'react';
import styles from './api-reference.module.scss';
import clsx from 'clsx';
import { useLocation, useHistory } from '@docusaurus/router';

const METHOD_KEY = {
  GET: 'get', POST: 'post', PUT: 'put', DELETE: 'del', DEL: 'del', PATCH: 'patch',
};

/**
 * Custom API sidebar with method badges.
 *
 * <ApiSidebar sections={[
 *   { title: 'REST API', items: [
 *     { label: 'Overview', href: '/cms/api/rest-api' },
 *     { label: 'Authentication', href: '/cms/api/rest-api/auth' },
 *   ]},
 *   { title: 'Entries', items: [
 *     { method: 'GET', label: 'List entries', href: '#list-entries' },
 *   ]},
 * ]} />
 */
export default function ApiSidebar({ sections = [] }) {
  const location = useLocation();

  const isActive = (href) => {
    if (href.startsWith('#')) {
      return location.hash === href;
    }
    return location.pathname === href || location.pathname === href + '/';
  };

  return (
    <aside className={styles.apiSidebar}>
      {sections.map((section, si) => (
        <React.Fragment key={si}>
          {si > 0 && <div className={styles.apiSidebar__divider} />}
          <div className={styles.apiSidebar__section}>
            {section.title && (
              <div className={styles.apiSidebar__sectionTitle}>{section.title}</div>
            )}
            {section.items.map((item, ii) => (
              <a
                key={ii}
                className={clsx(styles.sItem, isActive(item.href) && styles['sItem--active'])}
                href={item.href}
              >
                {item.method && (
                  <span className={clsx(
                    styles.sItem__badge,
                    styles[`sItem__badge--${METHOD_KEY[item.method.toUpperCase()] || 'get'}`]
                  )}>
                    {item.method.toUpperCase() === 'DELETE' ? 'DEL' : item.method.toUpperCase()}
                  </span>
                )}
                {item.label}
              </a>
            ))}
          </div>
        </React.Fragment>
      ))}
    </aside>
  );
}
