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
  /* Response links — smooth transition on hover */
  .mantine-Modal-body a:not(.mantine-Paper-root) {
    transition: color 0.15s ease !important;
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
  .mantine-Button-root:not([data-with-left-section]) {
    background: #FFFFFF !important;
    border: 1px solid rgba(0, 0, 0, 0.08) !important;
    color: #27272A !important;
  }
  .mantine-Button-root:not([data-with-left-section]):hover {
    background: #F4F4F5 !important;
    border-color: rgba(0, 0, 0, 0.12) !important;
  }
  .mantine-Button-root:not([data-with-left-section]) .mantine-Button-label {
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
  .mantine-Anchor-root {
    color: #A1A1AA !important;
  }
  /* Disclaimer banner — remove tinted background */
  .scrollable-container div:has(> .mantine-Group-root > .mantine-Text-root) {
    background: transparent !important;
    border: none !important;
  }
  /* Links hover — dark violet in light mode */
  .mantine-Modal-body a:not(.mantine-Paper-root):hover {
    color: #4945FF !important;
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
    color: #D4D4D8 !important;
  }
  .mantine-Modal-body .mantine-Text-root {
    color: #D4D4D8 !important;
  }
  /* Response content — headings, text, tables, links */
  .mantine-Modal-body h1,
  .mantine-Modal-body h2,
  .mantine-Modal-body h3,
  .mantine-Modal-body h4 {
    color: #FAFAFA !important;
  }
  .mantine-Modal-body p,
  .mantine-Modal-body li,
  .mantine-Modal-body td,
  .mantine-Modal-body span {
    color: #D4D4D8 !important;
  }
  .mantine-Modal-body th {
    color: #FAFAFA !important;
    background: rgba(255, 255, 255, 0.04) !important;
  }
  .mantine-Modal-body table {
    border-color: rgba(255, 255, 255, 0.08) !important;
  }
  .mantine-Modal-body td,
  .mantine-Modal-body th {
    border-color: rgba(255, 255, 255, 0.08) !important;
  }
  .mantine-Modal-body a {
    color: #7B79FF !important;
  }
  /* Links hover — brighter violet in dark mode */
  .mantine-Modal-body a:not(.mantine-Paper-root):hover {
    color: #A5A3FF !important;
  }
  .mantine-Modal-body strong {
    color: #FAFAFA !important;
  }
  /* Source cards (anchor elements styled as Paper) */
  a.mantine-Paper-root {
    background: #18181B !important;
    border: 1px solid rgba(255, 255, 255, 0.06) !important;
    color: #D4D4D8 !important;
  }
  a.mantine-Paper-root:hover {
    background: #1F1F23 !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
  }
  a.mantine-Paper-root .mantine-Text-root {
    color: #A1A1AA !important;
  }
  /* Action buttons (New chat, Copy, Good/Bad answer) */
  .mantine-Modal-body .mantine-UnstyledButton-root {
    color: #D4D4D8 !important;
  }
  .mantine-Modal-body .mantine-UnstyledButton-root:hover {
    background: rgba(255, 255, 255, 0.05) !important;
  }
  /* SVGs in modal body inherit light color */
  .mantine-Modal-body svg {
    color: #A1A1AA !important;
  }
  /* Disclaimer banner — remove the light bg, keep it transparent */
  .scrollable-container div:has(> .mantine-Group-root > .mantine-Text-root) {
    background: transparent !important;
    border: none !important;
  }
  /* Use MCP button in header — dark mode */
  .mantine-Modal-header .mantine-Group-root:has(> .mantine-Text-root) {
    background: #18181B !important;
    border: 1px solid rgba(255, 255, 255, 0.06) !important;
    color: #D4D4D8 !important;
  }
  .mantine-Modal-header .mantine-Group-root:has(> .mantine-Text-root):hover {
    background: #1F1F23 !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
  }
  .mantine-Modal-header .mantine-Group-root:has(> .mantine-Text-root) .mantine-Text-root {
    color: #D4D4D8 !important;
  }
  .mantine-Modal-header .mantine-Group-root:has(> .mantine-Text-root) svg {
    color: #D4D4D8 !important;
  }
  .mantine-Button-root:not([data-with-left-section]) {
    --button-bg: rgba(255, 255, 255, 0.04) !important;
    --button-hover: rgba(255, 255, 255, 0.1) !important;
    --button-color: #71717A !important;
    --button-bd: 1px solid transparent !important;
    background: rgba(255, 255, 255, 0.04) !important;
    border: 1px solid transparent !important;
    color: #71717A !important;
  }
  .mantine-Button-root:not([data-with-left-section]):hover {
    background: rgba(255, 255, 255, 0.1) !important;
    border-color: transparent !important;
    color: #D4D4D8 !important;
  }
  .mantine-Button-root:not([data-with-left-section]) .mantine-Button-label {
    color: inherit !important;
  }
  .mantine-Button-root:not([data-with-left-section]) svg {
    color: inherit !important;
  }
  /* Input wrapper (inner Paper-root) — match modal background */
  .mantine-Paper-root:has(.mantine-Textarea-input) {
    background: transparent !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
  }
  .mantine-Input-input,
  .mantine-Textarea-input {
    background: transparent !important;
    border-color: rgba(255, 255, 255, 0.06) !important;
    color: #FAFAFA !important;
  }
  .mantine-Input-input::placeholder,
  .mantine-Textarea-input::placeholder {
    color: #71717A !important;
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
  /* Deep Thinking button — dark-mode base state */
  .mantine-Button-root[data-with-left-section] {
    background: #18181B !important;
    border: 1px solid rgba(255, 255, 255, 0.06) !important;
    color: #D4D4D8 !important;
  }
  .mantine-Button-root[data-with-left-section] .mantine-Button-label {
    color: #D4D4D8 !important;
  }
  .mantine-Button-root[data-with-left-section]:hover {
    background: #1F1F23 !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
  }
  /* Deep Thinking active/expanded state — violet accent */
  .mantine-Button-root[data-with-left-section][aria-expanded="true"] {
    background: rgba(73, 69, 255, 0.12) !important;
    border-color: rgba(73, 69, 255, 0.4) !important;
    color: #A5B4FC !important;
  }
  .mantine-Button-root[data-with-left-section][aria-expanded="true"] .mantine-Button-label {
    color: #A5B4FC !important;
  }
  .mantine-Button-root[data-with-left-section][aria-expanded="true"] svg {
    color: #A5B4FC !important;
  }
  .mantine-Alert-root {
    background: transparent !important;
    border: 1px solid rgba(255, 255, 255, 0.06) !important;
  }
  .mantine-Modal-body code,
  .mantine-Modal-header code {
    background: #09090B !important;
    color: #E4E4E7 !important;
  }
  .mantine-Code-root {
    background: rgba(255, 255, 255, 0.06) !important;
    color: #E4E4E7 !important;
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
