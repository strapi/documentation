import React from 'react';
import { useLocation } from '@docusaurus/router';
import styles from './NavbarBreadcrumbs.module.scss';

const PRODUCTS = {
  cms: { switchTo: 'cloud', switchHref: '/cloud/intro' },
  cloud: { switchTo: 'cms', switchHref: '/cms/intro' },
};

// Segments whose URL path doesn't match their slug in the URL.
// e.g. /cms/api → /cms/content-api (because /cms/api is a 404)
const SEGMENT_REWRITES = {
  'cms/api': '/cms/content-api',
};

/**
 * Mockup-v3 style breadcrumbs that render inside the navbar.
 * Shows a monospace path-style trail: cms / getting-started / quick-start
 * The first segment (cms/cloud) shows a subtle switch link on hover.
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

  const rootSegment = segments[0]; // 'cms' or 'cloud'
  const product = PRODUCTS[rootSegment];

  // Map root sections to their intro pages
  const rootLinks = { cms: '/cms/intro', cloud: '/cloud/intro' };

  // Build breadcrumb items with cumulative paths
  const crumbs = segments.map((segment, index) => {
    const cumPath = segments.slice(0, index + 1).join('/');
    let href;
    if (index === 0 && rootLinks[segment]) {
      href = rootLinks[segment];
    } else if (SEGMENT_REWRITES[cumPath]) {
      href = SEGMENT_REWRITES[cumPath];
    } else {
      href = '/' + cumPath;
    }
    const isLast = index === segments.length - 1;
    return { label: segment, href, isLast, isRoot: index === 0 };
  });

  return (
    <div className={styles.navbarBreadcrumbs}>
      <div className={styles.separator} />
      <nav className={styles.crumbs} aria-label="Breadcrumbs">
        {crumbs.map((crumb, i) => (
          <React.Fragment key={crumb.href}>
            {i > 0 && <span className={styles.slash}>/</span>}
            {crumb.isRoot && product ? (
              <span className={styles.rootCrumb}>
                <a href={crumb.href} className={styles.crumbLink}>
                  {crumb.label}
                </a>
                <a href={product.switchHref} className={styles.switchLink}>
                  {product.switchTo} ↗
                </a>
              </span>
            ) : crumb.isLast ? (
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
