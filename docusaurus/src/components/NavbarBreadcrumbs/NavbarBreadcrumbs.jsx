import React, { useRef, useEffect, useCallback } from 'react';
import styles from './NavbarBreadcrumbs.module.scss';

const PRODUCTS = {
  cms: { switchTo: 'cloud', switchHref: '/cloud/intro' },
  cloud: { switchTo: 'cms', switchHref: '/cms/intro' },
};

const SEGMENT_REWRITES = {
  'cms/api': '/cms/api/content-api',
};

const ROOT_LINKS = { cms: '/cms/intro', cloud: '/cloud/intro' };

function buildCrumbs(pathname) {
  const segments = pathname.replace(/^\//, '').replace(/\/$/, '').split('/');
  if (segments.length === 0) return [];

  return segments.map((segment, index) => {
    const cumPath = segments.slice(0, index + 1).join('/');
    let href;
    if (index === 0 && ROOT_LINKS[segment]) {
      href = ROOT_LINKS[segment];
    } else if (SEGMENT_REWRITES[cumPath]) {
      href = SEGMENT_REWRITES[cumPath];
    } else {
      href = '/' + cumPath;
    }
    return { label: segment, href, isLast: index === segments.length - 1, isRoot: index === 0 };
  });
}

/**
 * Renders breadcrumbs into the container ref imperatively.
 * This bypasses React's render cycle which Docusaurus blocks for the navbar.
 */
function renderBreadcrumbs(container, pathname) {
  if (!container) return;

  const isDocPage = pathname.startsWith('/cms/') || pathname.startsWith('/cloud/');
  if (!isDocPage) {
    container.style.display = 'none';
    return;
  }
  container.style.display = '';

  const rootSegment = pathname.split('/')[1]; // 'cms' or 'cloud'
  const product = PRODUCTS[rootSegment];
  const crumbs = buildCrumbs(pathname);

  // Build HTML
  let html = `<div class="${styles.separator}"></div>`;
  html += `<nav class="${styles.crumbs}" aria-label="Breadcrumbs">`;

  crumbs.forEach((crumb, i) => {
    if (i > 0) html += `<span class="${styles.slash}">/</span>`;

    if (crumb.isRoot && product) {
      html += `<span class="${styles.rootCrumb}">`;
      html += `<a href="${crumb.href}" class="${styles.crumbLink}">${crumb.label}</a>`;
      html += `<a href="${product.switchHref}" class="${styles.switchLink}">${product.switchTo} ↗</a>`;
      html += `</span>`;
    } else if (crumb.isLast) {
      html += `<span class="${styles.current}">${crumb.label}</span>`;
    } else {
      html += `<a href="${crumb.href}" class="${styles.crumbLink}">${crumb.label}</a>`;
    }
  });

  html += `</nav>`;
  container.innerHTML = html;
}

/**
 * Mockup-v3 style breadcrumbs that render inside the navbar.
 * Shows a monospace path-style trail: cms / getting-started / quick-start
 * The first segment (cms/cloud) shows a subtle switch link on hover.
 *
 * Uses imperative DOM updates because Docusaurus memoizes the navbar tree
 * and prevents React re-renders on client-side navigation.
 */
export default function NavbarBreadcrumbs() {
  const containerRef = useRef(null);
  const lastPathRef = useRef('');

  const update = useCallback(() => {
    const current = window.location.pathname;
    if (current !== lastPathRef.current) {
      lastPathRef.current = current;
      renderBreadcrumbs(containerRef.current, current);
    }
  }, []);

  useEffect(() => {
    // Initial render
    lastPathRef.current = window.location.pathname;
    renderBreadcrumbs(containerRef.current, window.location.pathname);

    // Listen for all navigation types
    // 1. popstate (back/forward)
    window.addEventListener('popstate', update);

    // 2. Patch pushState/replaceState for SPA navigations
    const origPush = history.pushState;
    const origReplace = history.replaceState;
    history.pushState = function (...args) {
      origPush.apply(this, args);
      // Defer to next microtask so URL is updated
      Promise.resolve().then(update);
    };
    history.replaceState = function (...args) {
      origReplace.apply(this, args);
      Promise.resolve().then(update);
    };

    return () => {
      window.removeEventListener('popstate', update);
      history.pushState = origPush;
      history.replaceState = origReplace;
    };
  }, [update]);

  return <div ref={containerRef} className={styles.navbarBreadcrumbs} />;
}
