# View Modes: Elegant / Markdown / AI

**Date:** 2026-05-08
**Status:** Draft
**Branch:** Created from `next`

## Overview

Every documentation page offers 3 viewing modes, switchable via a control above the H1:

- **Elegant** -- the documentation as it exists today, with all visual components
- **Markdown** -- stripped-down, monospace rendering with no tabs, cards, or complex visual components
- **AI** -- a side panel occupying 50% of the viewport with a page summary and conversational AI chat

### Goals

1. **Accessibility / reading preference** -- some developers prefer raw markdown, others a polished site
2. **Efficiency by context** -- Elegant for discovery, Markdown for quick copy-paste, AI for deep exploration
3. **Differentiation** -- an innovative documentation experience that no one else offers

## Architecture

**Approach:** React Context + CSS Data Attributes

A `ViewModeProvider` context wraps the app at the `Root.js` level. The active mode is reflected on `<html data-view-mode="elegant|markdown|ai">`. Components that need structural changes read the context via `useViewMode()`. Pure visual changes (font, spacing) are handled in CSS via the data attribute selector.

This follows the existing pattern: `WidthToggle` already uses `data-content-width` on `<html>`.

### Component overview

```
Root.js
  |-- ViewModeProvider          (new)
  |     |-- viewMode state
  |     |-- localStorage sync (elegant/markdown only)
  |     |-- dispatches CustomEvent('view-mode-change')
  |
  |-- ReadingProgressBar        (existing)
  |-- KapaThemeInjector         (existing)
  |
  DocItemLayout (swizzled)
    |-- ViewModeSwitcher        (new, above H1)
    |-- WidthToggle             (existing, hidden in AI mode)
    |-- DocItemContent
    |     |-- Tabs              (modified: renders flat sections in markdown mode)
    |     |-- Cards             (modified: renders as list in markdown mode)
    |     |-- Admonitions       (unchanged)
    |     |-- Code blocks       (unchanged)
    |
    |-- AiPanel                 (new, mounted when viewMode === 'ai')
```

## Section 1: Mode Switcher

### Component: `ViewModeSwitcher`

Injected in the swizzled `DocItemLayout`, positioned above the H1.

**Visual design:**
- 3 text buttons: `ELEGANT MODE`, `MARKDOWN MODE`, `AI MODE`
- Font: `var(--strapi-font-family-technical)` (JetBrains Mono), uppercase
- Size: 12-13px (consistent with breadcrumbs)
- Spacing: ~16px gap between buttons
- Active state: `color: var(--strapi-primary-600)`, `border-bottom: 2px solid var(--strapi-primary-600)`
- Inactive state: `color: var(--strapi-neutral-500)`, hover to `var(--strapi-neutral-700)`
- Style: minimal tab bar, no background

### Persistence

- `localStorage.setItem('strapi-view-mode', 'elegant'|'markdown')`
- AI mode is **never persisted** -- always starts as off
- Default: `'elegant'`

### Anti-FOUC

An inline script in `headTags` (same pattern as the existing WidthToggle anti-FOUC script) reads localStorage and applies `data-view-mode` on `<html>` before React hydrates:

```javascript
(function() {
  var mode = localStorage.getItem('strapi-view-mode') || 'elegant';
  document.documentElement.setAttribute('data-view-mode', mode);
})();
```

## Section 2: ViewModeProvider

### React Context

```
ViewModeContext
  state:    viewMode: 'elegant' | 'markdown' | 'ai'
  actions:  setViewMode(mode)
  hook:     useViewMode() -> { viewMode, setViewMode }
```

**Provider behavior:**
- Reads `localStorage.strapi-view-mode` on mount, fallback to `'elegant'`
- On `setViewMode(mode)`:
  - Updates React state
  - Sets `document.documentElement.dataset.viewMode = mode`
  - If mode is `'elegant'` or `'markdown'`: writes to localStorage
  - Dispatches `CustomEvent('view-mode-change', { detail: { mode } })`

**Sidebar integration:**
- The sidebar already listens to custom events (`sidebar-v3-toggle`)
- On receiving `view-mode-change` with `mode: 'ai'`:
  - Store current sidebar state (expanded/collapsed)
  - Collapse the sidebar
- On receiving `view-mode-change` with `mode !== 'ai'`:
  - Restore the previously stored sidebar state

**Location:** Added in `Root.js`, wrapping children alongside existing providers.

## Section 3: Markdown Mode

When `data-view-mode="markdown"` is set on `<html>`:

### CSS changes (global, no React logic)

- All article content: `font-family: var(--strapi-font-family-technical)` (JetBrains Mono)
- Body font size reduced to ~14px (compensates for monospace width)
- Headings remain visually distinct but in monospace
- Card grids neutralized: `display: block` instead of `grid`/`flex`
- Decorative elements (card borders, shadows, backgrounds) simplified or removed

### Component modifications (via `useViewMode()`)

**Tabs (structural change required):**
- Instead of rendering a tabbed panel with tab headers, renders ALL tab panels sequentially
- Each panel is preceded by a heading `### {tab label}`
- This is the only component requiring a true structural change

**Cards (if used as grids):**
- Rendered as a simple vertical list

### Unchanged

- Admonitions -- kept as-is (they exist in standard Markdown)
- Code blocks -- already monospace
- Images -- kept
- TOC -- kept
- Sidebar -- visible and functional
- WidthToggle -- visible and functional

## Section 4: AI Mode

### Activation flow

1. User clicks "AI MODE" in the switcher
2. Provider sets `viewMode: 'ai'`
3. Sidebar receives `view-mode-change` event and collapses (storing previous state)
4. WidthToggle hides via CSS: `[data-view-mode="ai"] .width-toggle { display: none }`
5. `AiPanel` component mounts and slides in from the right

### Layout

- **Panel:** `position: fixed`, right side, `width: 50vw`, `height: calc(100vh - var(--ifm-navbar-height))`
- **Main content:** `[data-view-mode="ai"] .main-wrapper { width: 50vw }` -- stays in Elegant mode (all visual components)
- **Transition:** `transform: translateX(100%) -> translateX(0)`, `0.4s cubic-bezier(0.16, 1, 0.3, 1)` (same easing as sidebar)

### Panel content

1. **Header:** Title "AI Assistant" + close button (X) that deactivates AI mode
2. **Summary:** Displays the `<Tldr>` content of the current page. If no Tldr exists: "No summary available for this page"
3. **Separator + prompt:** "What would you like to know more about this topic?"
4. **Chat area:** Uses Kapa in embed/inline mode (to be investigated). MVP fallback: button that opens the classic Kapa modal with the page context pre-filled
5. **Input field:** Fixed at the bottom of the panel

### Navigation behavior

- When the page changes while AI mode is active:
  - Summary updates to the new page's Tldr
  - Chat history is reset
  - Panel remains open

### Deactivation flow

1. User clicks "ELEGANT" or "MARKDOWN" in the switcher, or the close button in the panel
2. Panel slides out to the right
3. Sidebar restores its previous state
4. WidthToggle reappears

## Section 5: Responsive

### Mobile (< 768px)

- Mode switcher is visible, all 3 modes available
- AI mode: panel opens in **full-screen** (`100vw`, `100vh`) overlaying the page
- A back button in the panel header returns to the page
- Elegant and Markdown modes work normally

### Tablet (768px - 1024px)

- All 3 modes available
- AI mode: panel takes ~60% width, content takes ~40%
- Sidebar is forced collapsed in AI mode

### Desktop (> 1024px)

- Nominal behavior as described above
- Panel: 50% width, content: 50%

## Dark mode

All 3 modes must work in both light and dark themes. The existing `@include dark { }` mixin pattern is used for all new CSS. The AI panel follows the same color token system (`--strapi-neutral-*`, `--strapi-primary-*`) that adapts automatically to the active theme.

## Open questions

1. **Kapa embed mode:** Does Kapa offer an inline/embed mode (not modal)? This needs investigation. If not available, the MVP fallback is a button in the panel that opens the existing Kapa modal with page context pre-filled.
2. **Naming:** "Elegant Mode" is a working name. Final name TBD before launch.
3. **Tldr coverage:** Not all pages have a `<Tldr>` component. Strategy for pages without one: show "No summary available" for MVP, consider build-time generation later.
