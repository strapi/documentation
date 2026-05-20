# Content Width Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 3-position content width toggle (Default/Wide/Max) to doc pages for accessibility.

**Architecture:** A `data-content-width` attribute on `<html>` drives a CSS custom property `--doc-content-max-width`. An inline script prevents FOUC by reading localStorage before React hydrates. A self-contained React component manages the toggle UI.

**Tech Stack:** React, SCSS modules, localStorage, inline SVG icons, Docusaurus swizzle (wrap)

**Target branch:** `next`

**Spec:** `docs/superpowers/specs/2026-05-07-content-width-toggle-design.md`

---

### File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `docusaurus/src/components/WidthToggle/WidthToggle.js` | Toggle component (buttons, state, localStorage, DOM attribute) |
| Create | `docusaurus/src/components/WidthToggle/widthToggle.module.scss` | Toggle styles (segmented control, dark mode) |
| Create | `docusaurus/src/theme/DocItem/Layout/index.js` | Swizzle wrap to mount WidthToggle above doc content |
| Modify | `docusaurus/src/scss/_base.scss` | Replace hardcoded max-width with CSS variable, add transition |
| Modify | `docusaurus/docusaurus.config.js` | Add anti-FOUC inline script |

---

### Task 1: Switch to `next` branch

**Files:** None

- [ ] **Step 1: Checkout next and pull latest**

```bash
cd /Users/piwi/code/documentation
git checkout next
git pull origin next
```

- [ ] **Step 2: Verify clean state**

```bash
git status
```

Expected: clean working tree on `next`.

---

### Task 2: Add CSS custom property for content width

**Files:**
- Modify: `docusaurus/src/scss/_base.scss`

- [ ] **Step 1: Add width CSS variables to `:root` block**

In `_base.scss`, after the existing `:root` block (line 7-9), add the content width variable. Then add the `data-content-width` attribute selectors.

Find the existing `:root` block:

```scss
:root {
  --custom-selection-background-color: var(--strapi-primary-600);
}
```

Replace with:

```scss
:root {
  --custom-selection-background-color: var(--strapi-primary-600);
  --doc-content-max-width: 720px;
}

[data-content-width="wide"] {
  --doc-content-max-width: 960px;
}

[data-content-width="max"] {
  --doc-content-max-width: 100%;
}
```

- [ ] **Step 2: Replace hardcoded mobile max-width with CSS variable**

Find the mobile rule (line 35-44):

```scss
main {
  article:first-child:not(.col):not(.custom-doc-card),
  article:first-child:not(.col) + nav {
    max-width: 640px;
    padding-left: 0 !important;
    padding-right: 0 !important;
    margin-left: auto;
    margin-right: auto;
  }
}
```

Replace with:

```scss
main {
  article:first-child:not(.col):not(.custom-doc-card),
  article:first-child:not(.col) + nav {
    max-width: var(--doc-content-max-width);
    padding-left: 0 !important;
    padding-right: 0 !important;
    margin-left: auto;
    margin-right: auto;
    transition: max-width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
}
```

Note: On mobile the toggle is hidden, and `640px` was already wider than most phone screens, so using the variable (720px default) is fine -- it will be clamped by the viewport anyway.

- [ ] **Step 3: Replace hardcoded desktop max-width values**

Find the desktop article rule inside `@include medium-up` (lines 52-58):

```scss
    article:first-child:not(.col):not(.custom-doc-card),
    article:first-child:not(.col) + nav:not(.pagination-nav) {
      max-width: 720px;
      padding-left: 40px !important;
      padding-right: 40px !important;
    }
```

Replace with:

```scss
    article:first-child:not(.col):not(.custom-doc-card),
    article:first-child:not(.col) + nav:not(.pagination-nav) {
      max-width: var(--doc-content-max-width);
      padding-left: 40px !important;
      padding-right: 40px !important;
    }
```

Find the pagination-nav rule (lines 60-64):

```scss
    article:first-child:not(.col) + nav.pagination-nav {
      max-width: 720px;
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
```

Replace with:

```scss
    article:first-child:not(.col) + nav.pagination-nav {
      max-width: var(--doc-content-max-width);
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
```

- [ ] **Step 4: Verify the build compiles**

```bash
cd /Users/piwi/code/documentation/docusaurus && npm run build 2>&1 | tail -5
```

Expected: build succeeds. No visual change yet (default is still 720px).

- [ ] **Step 5: Commit**

```bash
git add docusaurus/src/scss/_base.scss
git commit -m "Add CSS custom property for doc content width"
```

---

### Task 3: Add anti-FOUC inline script

**Files:**
- Modify: `docusaurus/docusaurus.config.js`

- [ ] **Step 1: Add inline script to the scripts array**

In `docusaurus.config.js`, find the end of the `scripts` array. The last entry before the closing `]` of the scripts array. Add a new entry at the **beginning** of the `scripts` array (so it runs first), right after `scripts: [`:

Find:

```js
  scripts: [
    {
      src: '/js/redirector.js',
      async: false, // Load synchronously to ensure it runs before page navigation
    },
```

Replace with:

```js
  scripts: [
    {
      // Anti-FOUC: apply saved content width before React hydrates
      tagName: 'script',
      innerHTML: '(function(){try{var w=localStorage.getItem("strapi-content-width");if(w)document.documentElement.dataset.contentWidth=w}catch(e){}})();',
    },
    {
      src: '/js/redirector.js',
      async: false, // Load synchronously to ensure it runs before page navigation
    },
```

Note: Docusaurus `scripts` supports inline scripts via `innerHTML` + `tagName: 'script'`. This runs synchronously before any other script.

- [ ] **Step 2: Verify the build compiles**

```bash
cd /Users/piwi/code/documentation/docusaurus && npm run build 2>&1 | tail -5
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add docusaurus/docusaurus.config.js
git commit -m "Add anti-FOUC script for content width preference"
```

---

### Task 4: Create WidthToggle component

**Files:**
- Create: `docusaurus/src/components/WidthToggle/WidthToggle.js`

- [ ] **Step 1: Create the component file**

```jsx
import React, { useState, useEffect, useCallback } from 'react';
import styles from './widthToggle.module.scss';

const STORAGE_KEY = 'strapi-content-width';
const WIDTHS = [
  { value: 'default', label: 'Default width', viewBox: '0 0 20 16' ,
    path: 'M5 1h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V3a2 2 0 012-2z' },
  { value: 'wide', label: 'Wide', viewBox: '0 0 20 16',
    path: 'M3 1h14a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V3a2 2 0 012-2z' },
  { value: 'max', label: 'Full width', viewBox: '0 0 20 16',
    path: 'M1 1h18a1 1 0 011 1v12a1 1 0 01-1 1H1a1 1 0 01-1-1V2a1 1 0 011-1z' },
];

function getInitialWidth() {
  if (typeof window === 'undefined') return 'default';
  try {
    return localStorage.getItem(STORAGE_KEY) || 'default';
  } catch {
    return 'default';
  }
}

export default function WidthToggle() {
  const [width, setWidth] = useState(getInitialWidth);

  // Sync DOM attribute on mount and changes
  useEffect(() => {
    if (width === 'default') {
      delete document.documentElement.dataset.contentWidth;
    } else {
      document.documentElement.dataset.contentWidth = width;
    }
  }, [width]);

  const handleChange = useCallback((value) => {
    setWidth(value);
    try {
      if (value === 'default') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, value);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const handleKeyDown = useCallback((e) => {
    const currentIndex = WIDTHS.findIndex((w) => w.value === width);
    let nextIndex;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % WIDTHS.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + WIDTHS.length) % WIDTHS.length;
    } else {
      return;
    }
    handleChange(WIDTHS[nextIndex].value);
  }, [width, handleChange]);

  return (
    <div
      className={styles.widthToggle}
      role="radiogroup"
      aria-label="Content width"
      onKeyDown={handleKeyDown}
    >
      {WIDTHS.map((w) => {
        const isActive = width === w.value;
        return (
          <button
            key={w.value}
            className={`${styles.button} ${isActive ? styles.active : ''}`}
            role="radio"
            aria-checked={isActive}
            aria-label={w.label}
            title={w.label}
            tabIndex={isActive ? 0 : -1}
            onClick={() => handleChange(w.value)}
          >
            <svg
              width="18"
              height="14"
              viewBox={w.viewBox}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={w.path} />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add docusaurus/src/components/WidthToggle/WidthToggle.js
git commit -m "Add WidthToggle component with localStorage persistence"
```

---

### Task 5: Create WidthToggle styles

**Files:**
- Create: `docusaurus/src/components/WidthToggle/widthToggle.module.scss`

- [ ] **Step 1: Create the SCSS module**

```scss
@use '../../scss/mixins' as *;

.widthToggle {
  display: none;

  @include medium-up {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 3px;
    border-radius: 8px;
    background: var(--strapi-neutral-150);
    float: right;
    margin-bottom: 8px;
  }
}

.button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--ifm-color-emphasis-600);
  cursor: pointer;
  padding: 0;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover:not(.active) {
    background: var(--strapi-neutral-200);
  }

  svg {
    display: block;
  }
}

.active {
  background: var(--strapi-primary-600);
  color: white;

  &:hover {
    background: var(--strapi-primary-600);
  }
}
```

- [ ] **Step 2: Verify the build compiles**

```bash
cd /Users/piwi/code/documentation/docusaurus && npm run build 2>&1 | tail -5
```

Expected: build succeeds (component not mounted yet, but SCSS module is valid).

- [ ] **Step 3: Commit**

```bash
git add docusaurus/src/components/WidthToggle/widthToggle.module.scss
git commit -m "Add WidthToggle styles with dark mode support"
```

---

### Task 6: Swizzle DocItem/Layout to mount the toggle

**Files:**
- Create: `docusaurus/src/theme/DocItem/Layout/index.js`

- [ ] **Step 1: Create the swizzle wrapper**

```jsx
import React from 'react';
import Layout from '@theme-original/DocItem/Layout';
import WidthToggle from '@site/src/components/WidthToggle/WidthToggle';

export default function LayoutWrapper(props) {
  return (
    <>
      <WidthToggle />
      <Layout {...props} />
    </>
  );
}
```

- [ ] **Step 2: Verify the build compiles**

```bash
cd /Users/piwi/code/documentation/docusaurus && npm run build 2>&1 | tail -5
```

Expected: build succeeds. The toggle is now mounted on every doc page.

- [ ] **Step 3: Commit**

```bash
git add docusaurus/src/theme/DocItem/Layout/index.js
git commit -m "Swizzle DocItem/Layout to mount width toggle"
```

---

### Task 7: Visual verification

**Files:** None (manual testing)

- [ ] **Step 1: Start dev server**

```bash
cd /Users/piwi/code/documentation/docusaurus && npm run start
```

- [ ] **Step 2: Verify on a regular doc page**

Open a regular doc page (e.g., http://localhost:3000/cms/intro). Check:
- Toggle appears top-right of content area
- Default button is active (blue background)
- Clicking Wide expands content to ~960px with smooth animation
- Clicking Max expands content to full available width
- Clicking Default returns to 720px
- Refresh the page: chosen width persists

- [ ] **Step 3: Verify on an API page**

Open an API page (e.g., http://localhost:3000/cms/api/document-service). Check:
- Toggle appears but API pages stay at full width regardless of selection
- No visual glitch or layout break

- [ ] **Step 4: Verify dark mode**

Toggle to dark mode via the theme switcher. Check:
- Active button has blue background, white icon (readable)
- Inactive buttons have appropriate contrast
- No color issues

- [ ] **Step 5: Verify mobile**

Resize browser below 996px. Check:
- Toggle is hidden
- Content is full-width as before

- [ ] **Step 6: Verify keyboard navigation**

Focus the toggle, use arrow keys. Check:
- Arrow Right/Down cycles forward through options
- Arrow Left/Up cycles backward
- Each option applies correctly

---

### Task 8: Adjust TOC-less page padding for width modes

**Files:**
- Modify: `docusaurus/src/scss/_base.scss`

When wide or max width is selected, the `padding-right: 280px` on TOC-less pages should be removed so content can actually use the extra space.

- [ ] **Step 1: Update the TOC-less padding rule**

Find (inside `@include medium-up`):

```scss
  [class*="docMainContainer"] .row:not(:has(.col--3)) {
    padding-right: 280px;
  }
```

Replace with:

```scss
  [class*="docMainContainer"] .row:not(:has(.col--3)) {
    padding-right: 280px;
  }

  /** When wide or max width, remove the TOC-placeholder padding */
  [data-content-width="wide"] [class*="docMainContainer"] .row:not(:has(.col--3)),
  [data-content-width="max"] [class*="docMainContainer"] .row:not(:has(.col--3)) {
    padding-right: 0;
  }
```

- [ ] **Step 2: Verify visually**

On a page without TOC, check that Wide and Max modes use the full available space.

- [ ] **Step 3: Commit**

```bash
git add docusaurus/src/scss/_base.scss
git commit -m "Remove TOC-placeholder padding in wide and max width modes"
```
