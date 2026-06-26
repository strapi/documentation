import { useEffect } from 'react';
import { useLocation } from '@docusaurus/router';

/**
 * Re-scroll to the URL hash after the page layout settles.
 *
 * On content-heavy pages (notably the Document Service API reference, which has
 * ~11 <Endpoint> blocks), the async components render and grow AFTER Docusaurus
 * performs its initial anchor scroll. The target heading then shifts hundreds of
 * pixels upward, landing far above the viewport (hidden under the navbar) even
 * though scroll-margin-top is set correctly. REST/GraphQL settle before the jump
 * so they were never affected.
 *
 * Fix: after navigating to a hash, re-run the scroll a few times as the layout
 * stabilizes, and once more when the document height stops changing, so the
 * target ends up at its scroll-margin-top offset (just below the sticky navbar
 * + view-mode toolbar). CSS scroll-margin-top owns the actual offset; this only
 * re-triggers the scroll against the final layout.
 */
export default function HashScrollFix() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;

    let cancelled = false;
    const id = decodeURIComponent(hash.replace(/^#/, ''));

    const scrollToTarget = () => {
      if (cancelled) return false;
      const el = document.getElementById(id);
      if (!el) return false;
      // scrollIntoView honors the element's scroll-margin-top.
      el.scrollIntoView({ block: 'start', behavior: 'auto' });
      return true;
    };

    // A few passes over the first ~1.2s catch the bulk of async reflow.
    const timers = [0, 120, 300, 600, 1000].map((delay) =>
      window.setTimeout(scrollToTarget, delay),
    );

    // Belt-and-suspenders: also re-scroll once the document height stabilizes
    // (e.g. images or late-hydrating blocks finishing), then disconnect.
    let lastHeight = document.documentElement.scrollHeight;
    let stableCount = 0;
    const interval = window.setInterval(() => {
      if (cancelled) return;
      const h = document.documentElement.scrollHeight;
      if (h !== lastHeight) {
        lastHeight = h;
        stableCount = 0;
        scrollToTarget();
      } else if (++stableCount >= 3) {
        scrollToTarget();
        window.clearInterval(interval);
      }
    }, 150);
    // Hard stop after 3s so the interval never lingers.
    const stop = window.setTimeout(() => window.clearInterval(interval), 3000);

    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
      window.clearInterval(interval);
      window.clearTimeout(stop);
    };
  }, [hash]);

  return null;
}
