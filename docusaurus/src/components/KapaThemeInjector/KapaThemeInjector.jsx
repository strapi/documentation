/**
 * KapaThemeInjector — Injects theme-aware styles into Kapa's Shadow DOM.
 *
 * Kapa renders its modal inside a Shadow DOM (#kapa-widget-container),
 * which prevents external CSS from reaching its elements. This component
 * observes the page theme (data-theme on <html>) and injects matching
 * styles directly into the shadow root.
 */
import { useEffect } from 'react';

const STYLE_ID = 'strapi-kapa-theme';

/** Shared styles applied in both modes */
const SHARED_STYLES = `
  .mantine-Paper-root {
    border-radius: 16px !important;
    overflow: hidden;
    font-family: var(--strapi-font-family-body, 'Inter', sans-serif);
  }
  .mantine-Modal-header {
    padding: 20px 24px !important;
  }
  .mantine-Modal-header .mantine-Title-root {
    font-family: var(--strapi-font-family-display, 'Inter Tight', sans-serif);
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  .mantine-CloseButton-root {
    border-radius: 10px !important;
    transition: all 0.2s !important;
  }
  .mantine-Button-root {
    border-radius: 10px !important;
    font-family: var(--strapi-font-family-body, 'Inter', sans-serif) !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    transition: all 0.2s !important;
  }
  .mantine-Input-input,
  .mantine-Textarea-input {
    font-family: var(--strapi-font-family-body, 'Inter', sans-serif) !important;
    font-size: 14px !important;
    transition: border-color 0.2s !important;
  }
  .mantine-Input-input:focus,
  .mantine-Textarea-input:focus {
    border-color: #4945FF !important;
    box-shadow: none !important;
    outline: none !important;
  }
  .mantine-ActionIcon-root {
    background: #4945FF !important;
    border: none !important;
    border-radius: 10px !important;
    transition: all 0.2s !important;
  }
  .mantine-ActionIcon-root:hover {
    background: #7B79FF !important;
  }
  .mantine-ActionIcon-root svg,
  .mantine-ActionIcon-root .mantine-ActionIcon-icon {
    color: #FFFFFF !important;
  }
  .mantine-Overlay-root {
    backdrop-filter: blur(4px) !important;
  }
  .mantine-Popover-dropdown {
    border-radius: 10px !important;
  }
`;

const LIGHT_STYLES = `
  .mantine-Paper-root {
    background: #FFFFFF !important;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.06) !important;
  }
  .mantine-Modal-header {
    background: #FFFFFF !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
  }
  .mantine-Modal-header .mantine-Title-root {
    color: #09090B !important;
  }
  .mantine-CloseButton-root {
    background: transparent !important;
    border: 1px solid rgba(0, 0, 0, 0.08) !important;
    color: #09090B !important;
  }
  .mantine-CloseButton-root:hover {
    background: #F4F4F5 !important;
    border-color: rgba(0, 0, 0, 0.12) !important;
  }
  .mantine-Modal-body {
    background: #FFFFFF !important;
  }
  .mantine-Modal-body .mantine-Text-root {
    color: #27272A !important;
  }
  .mantine-Button-root {
    background: #FFFFFF !important;
    border: 1px solid rgba(0, 0, 0, 0.08) !important;
    color: #27272A !important;
  }
  .mantine-Button-root:hover {
    background: #F4F4F5 !important;
    border-color: rgba(0, 0, 0, 0.12) !important;
  }
  .mantine-Button-root .mantine-Button-label {
    color: #27272A !important;
  }
  .mantine-Input-input,
  .mantine-Textarea-input {
    background: #FFFFFF !important;
    border-color: rgba(0, 0, 0, 0.08) !important;
    color: #09090B !important;
  }
  .mantine-Input-input::placeholder,
  .mantine-Textarea-input::placeholder {
    color: #A1A1AA !important;
  }
  .mantine-UnstyledButton-root {
    color: #27272A !important;
  }
  .mantine-Anchor-root {
    color: #A1A1AA !important;
  }
  .mantine-Popover-dropdown {
    background: #FFFFFF !important;
    border: 1px solid rgba(0, 0, 0, 0.08) !important;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
  }
`;

const DARK_STYLES = `
  .mantine-Paper-root {
    background: #111113 !important;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08) !important;
  }
  .mantine-Modal-header {
    background: #111113 !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
  }
  .mantine-Modal-header .mantine-Title-root {
    color: #FAFAFA !important;
  }
  .mantine-CloseButton-root {
    background: transparent !important;
    border: 1px solid rgba(255, 255, 255, 0.06) !important;
    color: #FAFAFA !important;
  }
  .mantine-CloseButton-root:hover {
    background: #1F1F23 !important;
  }
  .mantine-CloseButton-root svg {
    color: #FAFAFA !important;
  }
  .mantine-Modal-body {
    background: #111113 !important;
  }
  .mantine-Modal-body .mantine-Text-root {
    color: #D4D4D8 !important;
  }
  .mantine-Button-root {
    background: #18181B !important;
    border: 1px solid rgba(255, 255, 255, 0.06) !important;
    color: #D4D4D8 !important;
  }
  .mantine-Button-root:hover {
    background: #1F1F23 !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
  }
  .mantine-Button-root .mantine-Button-label {
    color: #D4D4D8 !important;
  }
  .mantine-Input-input,
  .mantine-Textarea-input {
    background: #18181B !important;
    border-color: rgba(255, 255, 255, 0.06) !important;
    color: #FAFAFA !important;
  }
  .mantine-Input-input::placeholder,
  .mantine-Textarea-input::placeholder {
    color: #71717A !important;
  }
  .mantine-UnstyledButton-root {
    color: #D4D4D8 !important;
  }
  .mantine-Anchor-root {
    color: #71717A !important;
  }
  .mantine-Popover-dropdown {
    background: #18181B !important;
    border: 1px solid rgba(255, 255, 255, 0.06) !important;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3) !important;
    color: #FAFAFA !important;
  }
  .mantine-Alert-root {
    background: transparent !important;
    border: 1px solid rgba(255, 255, 255, 0.06) !important;
  }
  .mantine-Modal-body code,
  .mantine-Modal-header code {
    background: #09090B !important;
  }
  .mantine-Modal-body pre,
  .mantine-Modal-header pre {
    border: 1px solid rgba(255, 255, 255, 0.06) !important;
  }
`;

function injectStyles(theme) {
  const container = document.getElementById('kapa-widget-container');
  const shadow = container?.shadowRoot;
  if (!shadow) return;

  let styleEl = shadow.getElementById(STYLE_ID);
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = STYLE_ID;
    shadow.appendChild(styleEl);
  }

  const themeStyles = theme === 'dark' ? DARK_STYLES : LIGHT_STYLES;
  styleEl.textContent = SHARED_STYLES + themeStyles;
}

export default function KapaThemeInjector() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const getTheme = () => document.documentElement.dataset.theme || 'light';

    // Inject immediately if container already exists
    injectStyles(getTheme());

    // Observe theme changes on <html>
    const observer = new MutationObserver(() => {
      injectStyles(getTheme());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    // Also observe when Kapa container appears in the DOM (lazy-loaded)
    const bodyObserver = new MutationObserver(() => {
      const container = document.getElementById('kapa-widget-container');
      if (container?.shadowRoot) {
        injectStyles(getTheme());
      }
    });
    bodyObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      bodyObserver.disconnect();
    };
  }, []);

  return null;
}
