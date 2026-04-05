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
  /* Code blocks — add padding-right so copy button doesn't overlap text */
  div:has(> .mantine-ActionIcon-root) > div {
    padding-right: 40px !important;
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
  /* Suggestion buttons (default variant, no icon) */
  .mantine-Button-root[data-variant="default"]:not([data-with-left-section]) {
    background: #FFFFFF !important;
    border: 1px solid rgba(0, 0, 0, 0.08) !important;
    color: #27272A !important;
  }
  .mantine-Button-root[data-variant="default"]:not([data-with-left-section]):hover {
    background: #F4F4F5 !important;
    border-color: rgba(0, 0, 0, 0.12) !important;
  }
  .mantine-Button-root[data-variant="default"]:not([data-with-left-section]) .mantine-Button-label {
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
  /* Override Mantine root CSS variables — Kapa forces data-mantine-color-scheme="light",
     so we must redefine these for dark mode to propagate through var() references */
  #kapa-widget-root {
    --mantine-color-gray-light: rgba(255, 255, 255, 0.06) !important;
    --mantine-color-gray-light-hover: rgba(255, 255, 255, 0.1) !important;
    --mantine-color-gray-light-color: #A1A1AA !important;
  }
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
  /* Suggestion buttons (default variant, no icon) */
  .mantine-Button-root[data-variant="default"]:not([data-with-left-section]) {
    --button-bg: #18181B !important;
    --button-hover: #1F1F23 !important;
    --button-color: #D4D4D8 !important;
    --button-bd: 1px solid rgba(255, 255, 255, 0.06) !important;
    background: #18181B !important;
    border: 1px solid rgba(255, 255, 255, 0.06) !important;
    color: #D4D4D8 !important;
  }
  .mantine-Button-root[data-variant="default"]:not([data-with-left-section]):hover {
    background: #1F1F23 !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
  }
  .mantine-Button-root[data-variant="default"]:not([data-with-left-section]) .mantine-Button-label {
    color: #D4D4D8 !important;
  }
  /* Action buttons — New chat, Copy, Good/Bad answer (light variant) */
  .mantine-Button-root[data-variant="light"] {
    --button-bg: rgba(255, 255, 255, 0.04) !important;
    --button-hover: rgba(255, 255, 255, 0.1) !important;
    --button-color: #71717A !important;
    --button-bd: 1px solid transparent !important;
    background: rgba(255, 255, 255, 0.04) !important;
    border: 1px solid transparent !important;
    color: #71717A !important;
  }
  .mantine-Button-root[data-variant="light"]:hover {
    background: rgba(255, 255, 255, 0.1) !important;
    border-color: transparent !important;
    color: #D4D4D8 !important;
  }
  .mantine-Button-root[data-variant="light"] .mantine-Button-label {
    color: inherit !important;
  }
  .mantine-Button-root[data-variant="light"] svg {
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
  /* Deep Thinking button — dark-mode base state (default variant + left section) */
  .mantine-Button-root[data-variant="default"][data-with-left-section] {
    background: #18181B !important;
    border: 1px solid rgba(255, 255, 255, 0.06) !important;
    color: #D4D4D8 !important;
  }
  .mantine-Button-root[data-variant="default"][data-with-left-section] .mantine-Button-label {
    color: #D4D4D8 !important;
  }
  .mantine-Button-root[data-variant="default"][data-with-left-section]:hover {
    background: #1F1F23 !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
  }
  /* Deep Thinking active/expanded state — violet accent */
  .mantine-Button-root[data-variant="default"][data-with-left-section][aria-expanded="true"] {
    background: rgba(73, 69, 255, 0.12) !important;
    border-color: rgba(73, 69, 255, 0.4) !important;
    color: #A5B4FC !important;
  }
  .mantine-Button-root[data-variant="default"][data-with-left-section][aria-expanded="true"] .mantine-Button-label {
    color: #A5B4FC !important;
  }
  .mantine-Button-root[data-variant="default"][data-with-left-section][aria-expanded="true"] svg {
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

const DEEP_THINKING_LABEL_DISABLED = 'Enable deep thinking';
const DEEP_THINKING_LABEL_ENABLED = 'Deep thinking enabled';

/**
 * Overrides the Deep Thinking button label based on its toggle state.
 *
 * Kapa uses data-variant="outline" when enabled, "default" when disabled.
 * React re-renders the label text on every hover/state change, replacing
 * any DOM text we set. To counteract this we observe both:
 *   – button attributes (data-variant) to detect toggle state changes
 *   – label childList to catch React text-node replacements
 *
 * Returns a cleanup function, or null if the button is not found yet.
 */
function setupDeepThinkingLabel(shadow) {
  if (!shadow) return null;

  const btn = shadow.querySelector(
    '.mantine-Button-root[data-with-left-section][aria-haspopup="dialog"]'
  );
  if (!btn) return null;

  const labelEl = btn.querySelector('.mantine-Button-label');
  if (!labelEl) return null;

  let updating = false; // guard against infinite recursion

  const update = () => {
    if (updating) return;
    updating = true;
    const isEnabled = btn.getAttribute('data-variant') === 'outline';
    const desired = isEnabled
      ? DEEP_THINKING_LABEL_ENABLED
      : DEEP_THINKING_LABEL_DISABLED;
    if (labelEl.textContent !== desired) {
      labelEl.textContent = desired;
    }
    updating = false;
  };

  // Set initial label
  update();

  // Watch button attributes for state changes (variant, aria-expanded)
  const btnObs = new MutationObserver(update);
  btnObs.observe(btn, {
    attributes: true,
    attributeFilter: ['data-variant', 'aria-expanded'],
  });

  // Watch label childList to catch React re-renders that replace our text
  const labelObs = new MutationObserver(update);
  labelObs.observe(labelEl, { childList: true, subtree: true });

  return {
    disconnect() {
      btnObs.disconnect();
      labelObs.disconnect();
    },
  };
}

export default function KapaThemeInjector() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const getTheme = () => document.documentElement.dataset.theme || 'light';
    let deepThinkingObserver = null;
    let trackedBtn = null; // the DOM node we're currently observing

    function ensureDeepThinkingLabel(shadow) {
      if (!shadow) return;
      const btn = shadow.querySelector(
        '.mantine-Button-root[data-with-left-section][aria-haspopup="dialog"]'
      );
      // Re-attach if the button is new (Kapa re-rendered its tree)
      if (btn && btn !== trackedBtn) {
        deepThinkingObserver?.disconnect();
        deepThinkingObserver = setupDeepThinkingLabel(shadow);
        trackedBtn = btn;
      }
    }

    // Inject immediately if container already exists
    injectStyles(getTheme());

    const container = document.getElementById('kapa-widget-container');
    if (container?.shadowRoot) {
      ensureDeepThinkingLabel(container.shadowRoot);
    }

    // Observe theme changes on <html>
    const themeObserver = new MutationObserver(() => {
      injectStyles(getTheme());
      // Kapa may re-render on theme change — re-attach label observer
      const c = document.getElementById('kapa-widget-container');
      if (c?.shadowRoot) ensureDeepThinkingLabel(c.shadowRoot);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    // Observe when Kapa container appears or re-renders in the DOM
    const bodyObserver = new MutationObserver(() => {
      const c = document.getElementById('kapa-widget-container');
      if (c?.shadowRoot) {
        injectStyles(getTheme());
        ensureDeepThinkingLabel(c.shadowRoot);
      }
    });
    bodyObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      themeObserver.disconnect();
      bodyObserver.disconnect();
      deepThinkingObserver?.disconnect();
    };
  }, []);

  return null;
}
