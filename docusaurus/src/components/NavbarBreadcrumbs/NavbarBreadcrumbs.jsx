import React from 'react';
import { useLocation } from '@docusaurus/router';
import styles from './NavbarBreadcrumbs.module.scss';

/**
 * Mockup-v3 style breadcrumbs that render inside the navbar.
 * Shows a monospace path-style trail: cms / getting-started / quick-start
 * Only visible on doc pages (paths starting with /cms/ or /cloud/).
 */
export default function NavbarBreadcrumbs() {
  const { pathname } = useLocation();

  // Only show on doc pages
  const isDocPage = pathname.startsWith('/cms/') || pathname.startsWith('/cloud/');
  if (!isDocPage) return null;

  // Build crumbs from URL path segments
  const segments = pathname.replace(/^\//, '').replace(/\/$/, '').split('/');
  if (segments.length === 0) return null;

  // Build breadcrumb items with cumulative paths
  const crumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const isLast = index === segments.length - 1;
    return { label: segment, href, isLast };
  });

  return (
    <div className={styles.navbarBreadcrumbs}>
      <span className={styles.separator}>|</span>
      <nav className={styles.crumbs} aria-label="Breadcrumbs">
        {crumbs.map((crumb, i) => (
          <React.Fragment key={crumb.href}>
            {i > 0 && <span className={styles.slash}>/</span>}
            {crumb.isLast ? (
              <span className={styles.current}>{crumb.label}</span>
            ) : (
              <a href={crumb.href} className={styles.crumbLink}>
                {crumb.label}
              </a>
            )}
          </React.Fragment>
        ))}
      </nav>
    </div>
  );
}
