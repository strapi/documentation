
# Strapi Documentation Site Redesign -- Implementation Plan
## Executive Summary
A bold, futuristic, and elegant redesign of the Strapi documentation site built on Docusaurus 3.5.2. This plan preserves the existing content structure and MDX files while transforming the visual identity through a new typography system, refined color palette, animated interactions, collapsible sidebars, a reimagined homepage, a Stripe-style API documentation layout, and strategic integration of the Pretext library for advanced text effects.
After thorough exploration of the codebase I have mapped out the complete architecture: the SCSS token system in `_tokens.scss`, the 48+ SCSS component files loaded via `__index.scss`, the 71+ React components in `src/components/`, the 13 swizzled theme components in `src/theme/`, the homepage in `src/pages/home/Home.jsx`, and the existing patterns for dark mode, responsive breakpoints, and transitions.
---
## Phase 0: Foundation -- Typography and Color System
### 0A. New Typography System
**Font pairing recommendation:**
- **Display/Headings:** Inter Tight -- geometric, modern, sharp at large sizes, variable font
- **Body:** Inter -- screen-optimized, extensive OpenType features, variable font
- **Monospace:** JetBrains Mono -- excellent for code, ligature support
Rationale: Inter Tight provides geometric sharpness and futuristic feel at display sizes. Inter for body ensures maximum legibility. Both are variable fonts enabling fine-grained weight control. This replaces the current mix of Poppins (barely used, only in `.font-poppins` class) and SF Pro system fonts (hardcoded in multiple files).
**File to modify: `/docusaurus/src/scss/_fonts.scss`**
Replace the Poppins Google Fonts import. Remove the `.font-poppins` class. Instead load Inter Tight (400-800) + Inter (300-700) + JetBrains Mono (400-600) via a single Google Fonts URL with `display=swap`.
**File to modify: `/docusaurus/src/scss/_tokens.scss`**
Add new font tokens to the `:root` block:
```
--strapi-font-size-display: 3.5rem       (56px, hero headlines)
--strapi-font-size-display-sm: 2.75rem   (44px, section headlines)
--strapi-font-size-4xl: 2.5rem           (40px)
--strapi-line-height-display: 1.1
--strapi-line-height-display-sm: 1.15
--strapi-font-family-display: "Inter Tight", sans-serif
--strapi-font-family-body: "Inter", sans-serif
--strapi-font-family-mono: "JetBrains Mono", monospace
--strapi-letter-spacing-tight: -0.02em
--strapi-letter-spacing-tighter: -0.03em
```
**File to modify: `/docusaurus/src/scss/typography.scss`**
Replace the `:root` font-family from SF Pro to `var(--strapi-font-family-body)`. Replace heading font-family from SF Pro Display to `var(--strapi-font-family-display)`. Add negative letter-spacing on headings. Currently the `:root` is on line 7 and headings on lines 14-18.
**Files requiring SF Pro font-family removal (hardcoded in multiple places):**
- `/docusaurus/src/scss/ai-toolbar.scss` -- line 28
- `/docusaurus/src/pages/home/home.module.scss` -- lines 17 and 31 (`.heroTitle` and `.heroDescription`)
- `/docusaurus/src/components/Card/card.module.scss` -- lines 93 and 117 (`.card__title` and `.card__description`)
- `/docusaurus/src/components/HomepageAIButton/homepageaibutton.module.scss` -- line 32
All of these should reference `var(--strapi-font-family-display)` or `var(--strapi-font-family-body)` instead.
### 0B. Color System Refinements
**File to modify: `/docusaurus/src/scss/_tokens.scss`**
Add to the existing `:root` block:
Surface hierarchy tokens (layered backgrounds for visual depth):
```
--strapi-surface-0: #FFFFFF
--strapi-surface-1: #FAFAFE
--strapi-surface-2: #F4F4FB
--strapi-surface-3: #EDEDF7
```
Gradient tokens:
```
--strapi-gradient-primary: linear-gradient(135deg, #4945FF 0%, #7B79FF 100%)
--strapi-gradient-accent: linear-gradient(135deg, #9736E8 0%, #4945FF 100%)
--strapi-gradient-surface: linear-gradient(180deg, var(--strapi-surface-1) 0%, var(--strapi-surface-0) 100%)
```
Glow tokens:
```
--strapi-glow-primary: 0 0 40px rgba(73, 69, 255, 0.15)
--strapi-glow-accent: 0 0 40px rgba(151, 54, 232, 0.15)
```
Elevation system (replacing ad-hoc box-shadow values scattered across the codebase):
```
--strapi-shadow-xs: 0 1px 2px rgba(24, 24, 38, 0.04)
--strapi-shadow-sm: 0 2px 8px rgba(24, 24, 38, 0.06)
--strapi-shadow-md: 0 4px 16px rgba(24, 24, 38, 0.08)
--strapi-shadow-lg: 0 8px 32px rgba(24, 24, 38, 0.10)
--strapi-shadow-xl: 0 16px 48px rgba(24, 24, 38, 0.12)
```
Border radius system (more generous for futuristic feel):
```
--strapi-radius-sm: 6px
--strapi-radius-md: 10px
--strapi-radius-lg: 16px
--strapi-radius-xl: 24px
--strapi-radius-full: 9999px
```
Dark mode additions in the existing `@include dark` block:
```
--strapi-surface-0: #181826
--strapi-surface-1: #1E1E30
--strapi-surface-2: #252539
--strapi-surface-3: #2C2C44
--strapi-glow-primary: 0 0 60px rgba(73, 69, 255, 0.25)
--strapi-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3)
--strapi-shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4)
--strapi-shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5)
```
**File to modify: `/docusaurus/src/scss/_tokens-overrides.scss`**
Update border-radius references in Infima overrides to use the new radius tokens.
---
## Phase 1: Animation System and Shared Infrastructure
### 1A. Animation System
**Decision: CSS-only animations plus one lightweight JS hook.** No Framer Motion, no GSAP. The site must remain performant and under Docusaurus's bundle size expectations.
**File to CREATE: `/docusaurus/src/scss/_animations.scss`**
Contents:
- Custom timing functions as CSS variables: `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)`, `--ease-out-quart`, `--ease-in-out-quart`, `--spring: cubic-bezier(0.34, 1.56, 0.64, 1)`
- Duration variables: `--duration-fast: 150ms`, `--duration-normal: 250ms`, `--duration-slow: 400ms`, `--duration-slower: 600ms`
- Keyframe definitions: `fadeInUp`, `fadeIn`, `slideInLeft`, `slideInRight`, `scaleIn`, `shimmer`
- Utility class `.reveal` that applies `fadeInUp` with a `--stagger` delay variable
- Utility class `.lift-on-hover` for transform + shadow transitions
- All animations wrapped in `@media (prefers-reduced-motion: no-preference)` for accessibility
**File to modify: `/docusaurus/src/scss/__index.scss`**
Add `@forward 'animations';` after the `@forward 'tokens-overrides';` line (after line 4 in the current file).
**File to modify: `/docusaurus/src/scss/_mixins.scss`**
Add parametric transition mixins alongside the existing `@mixin transition`:
```scss
@mixin transition-smooth($property: all) {
  transition: $property var(--duration-normal) var(--ease-out-expo);
}
@mixin transition-slow($property: all) {
  transition: $property var(--duration-slow) var(--ease-out-expo);
}
```
**File to CREATE: `/docusaurus/src/hooks/useScrollReveal.js`**
A React hook using IntersectionObserver. Returns a `ref` to attach to an element. When the element enters the viewport, it adds an `is-visible` class. Observer disconnects after first intersection (fire-once). Options for `threshold` (default 0.1) and `rootMargin` (default `0px 0px -50px 0px`). This replaces any need for a scroll animation library.
### 1B. Layout Spacing Update
**File to modify: `/docusaurus/src/scss/_tokens.scss`**
Add larger spacing tokens:
```
--strapi-spacing-12: 4rem     (64px)
--strapi-spacing-14: 5rem     (80px)
--strapi-spacing-16: 6rem     (96px)
--strapi-spacing-20: 8rem     (128px)
```
**File to modify: `/docusaurus/src/scss/_base.scss`**
The current article max-width is 608px (mobile) / 672px (desktop) with 32px padding (lines 18-19 and 59-60). Increase to:
- Mobile: 640px max-width
- Desktop: 720px max-width, 40px horizontal padding
- This gives content more room to breathe without feeling overly wide
---
## Phase 2: Collapsible Sidebars
### 2A. Left Sidebar (Doc Sidebar)
The Docusaurus config already has `hideable: true` (line 211-213 of `docusaurus.config.js`). The existing mechanism uses Docusaurus's built-in collapse which is abrupt. We enhance it with smooth CSS transitions.
**File to modify: `/docusaurus/src/scss/sidebar.scss`**
Add to the file:
```scss
aside[class*="docSidebarContainer"] {
  transition: width var(--duration-slow) var(--ease-out-expo),
              min-width var(--duration-slow) var(--ease-out-expo),
              opacity var(--duration-normal) var(--ease-out-expo);
  will-change: width, min-width;
}
```
**File to CREATE: `/docusaurus/src/theme/DocSidebar/Desktop/index.js`**
Swizzle the Desktop sidebar variant (currently only the parent `DocSidebar/index.js` is swizzled). This new file wraps `@theme-original/DocSidebar/Desktop` and:
1. Adds a floating toggle button (32x32 circle, positioned at the right edge of the sidebar, vertically centered)
2. The button uses Phosphor icons: `ph-caret-left` when expanded, `ph-caret-right` when collapsed
3. Stores collapsed state in `localStorage` key `strapi-docs-sidebar-collapsed`
4. When collapsed, renders a 40px-wide rail with just the expand button
5. The collapse is CSS-driven via a `.sidebar--collapsed` class that sets `width: 40px` with transition
**File to CREATE: `/docusaurus/src/theme/DocSidebar/Desktop/desktop-sidebar.module.scss`**
Styles for the toggle button and collapsed rail state.
### 2B. Right Sidebar (Table of Contents)
The TOC has no built-in collapse mechanism. We create one.
**File to CREATE: `/docusaurus/src/components/CollapsibleTOC/CollapsibleTOC.jsx`**
A wrapper component for the TOC that:
1. Accepts `children` (the actual TOC content)
2. Maintains a `collapsed` boolean state (persisted to `localStorage` key `strapi-docs-toc-collapsed`)
3. Renders a container div with width transition (`240px` to `40px`)
4. When collapsed, the TOC content has `opacity: 0` and `pointer-events: none`
5. A toggle button (Phosphor `ph-list` icon) is always visible
**File to CREATE: `/docusaurus/src/components/CollapsibleTOC/collapsible-toc.module.scss`**
Key CSS:
- Container: `transition: width var(--duration-slow) var(--ease-out-expo)`
- Content: `transition: opacity var(--duration-normal) ease`
- Toggle button: Floating circle at the left edge, with hover glow (`box-shadow: var(--strapi-glow-primary)`)
**File to modify: `/docusaurus/src/theme/TOC/index.js`**
Currently this file just re-exports the original TOC. Wrap the return value with `<CollapsibleTOC>`.
---
## Phase 3: Homepage Complete Redesign
### 3A. New Homepage Structure
New section order (top to bottom):
1. News Ticker (enhanced existing)
2. Hero Section (reimagined with Pretext animation)
3. AI Search Bar (prominent, centered, search-input style)
4. Category Cards (CMS + Cloud, redesigned)
5. Quick Links Grid (new section)
6. Footer (existing, to be refined in Phase 8)
**File to modify: `/docusaurus/src/pages/home/Home.jsx`**
Complete rewrite of the JSX structure. Key changes:
- Import new `HomepageHero` component instead of generic `Hero`
- Import new `QuickLinks` component
- Replace the inline `<style>` blocks with proper SCSS module classes
- Add `useScrollReveal` refs to sections for staggered reveal animations
- Remove the `NAVBAR_TRANSLUCENT_UNTIL_SCROLL_Y` scroll listener in favor of CSS `backdrop-filter`
**File to modify: `/docusaurus/src/pages/home/home.module.scss`**
Complete rewrite. Remove all hardcoded font-families. Use token variables throughout.
**File to modify: `/docusaurus/src/pages/home/_home.content.js`**
Add `quickLinks` array with items like Quick Start, REST API, GraphQL, Content Manager, Deployment, Customization -- each with title, description, icon name, and link path.
### 3B. Hero Section
**File to CREATE: `/docusaurus/src/components/HomepageHero/HomepageHero.jsx`**
A new hero component featuring:
- Full-width background with a subtle radial gradient (primary-100 center to transparent in light mode; deep indigo-to-black in dark mode)
- Fine dot grid pattern overlay via CSS `radial-gradient` repeating pattern
- Mouse-tracking parallax: `onMouseMove` handler updates `--mouse-x` and `--mouse-y` CSS vars, background-position shifts subtly
- Large display title: Inter Tight, 56px, weight 700, letter-spacing -0.03em
- The title uses `PretextReveal` for character-by-character reveal on load (see Phase 6)
- Subtitle: Inter, 20px, neutral-500, max-width 600px
- Generous vertical padding: 96px top, 48px bottom
**File to CREATE: `/docusaurus/src/components/HomepageHero/homepage-hero.module.scss`**
### 3C. AI Search Bar Redesign
**File to modify: `/docusaurus/src/components/HomepageAIButton/HomepageAIButton.js`**
Transform from a button into a search-bar-style input:
- 600px wide, centered
- Left icon: Phosphor `sparkle`
- Placeholder text: "Ask AI anything about Strapi..."
- Keyboard shortcut badge on the right: `Cmd+K` styled as a subtle pill
- Still triggers Kapa widget on click via the `kapa-widget-button` class
- Element remains a `<button>` for accessibility, styled as an input
**File to modify: `/docusaurus/src/components/HomepageAIButton/homepageaibutton.module.scss`**
New styling:
- `border-radius: var(--strapi-radius-lg)` (16px)
- `border: 1px solid var(--strapi-neutral-200)`
- On hover: `border-color: var(--strapi-primary-500)`, `box-shadow: var(--strapi-glow-primary)`
- Background shimmer animation on hover (via `background-size: 200%` and `shimmer` keyframe)
- Remove the current explosive purple hover effect (lines 52-64 of the current SCSS) -- replace with the subtler glow
### 3D. Category Cards Redesign
**File to modify: `/docusaurus/src/components/Card/Card.jsx`**
**File to modify: `/docusaurus/src/components/Card/card.module.scss`**
New card design characteristics:
- `border-radius: var(--strapi-radius-lg)` (16px, up from current 4px)
- CMS card: subtle gradient from `var(--strapi-primary-100)` to white
- Cloud card: subtle gradient from `var(--strapi-secondary-100)` to white
- Icon container: 48px circle with matching gradient background
- Title: `var(--strapi-font-family-display)`, 24px, weight 700
- Description: `var(--strapi-font-family-body)`, 15px, neutral-500
- CTA with animated arrow (existing pattern, enhanced timing)
- On hover: `transform: translateY(-4px)`, `box-shadow: var(--strapi-shadow-lg)`, screenshot scales 1.02
- Stagger: first card `--stagger: 0ms`, second card `--stagger: 100ms`
### 3E. Quick Links Grid
**File to CREATE: `/docusaurus/src/components/QuickLinks/QuickLinks.jsx`**
**File to CREATE: `/docusaurus/src/components/QuickLinks/quick-links.module.scss`**
A 3-column grid (2 columns on tablet, 1 on mobile) of popular documentation pages:
- Each item: 48px row with Phosphor icon (filled) on the left, title + short description, subtle right arrow
- Hover: background shifts to `var(--strapi-surface-1)`, arrow slides right 4px
- Section header: "Popular pages" in uppercase, 11px, neutral-400, letter-spacing 1px
- Scroll-reveal animation with stagger per item
---
## Phase 4: Doc Page Layout Refinement
### 4A. More Breathing Room
**File to modify: `/docusaurus/src/scss/_base.scss`**
- Increase article max-width: 608px to 640px (mobile), 672px to 720px (desktop)
- Increase horizontal padding from 32px to 40px on desktop
**File to modify: `/docusaurus/src/scss/typography.scss`**
- Increase paragraph line-height from `24px` to `28px` (1.75 at 16px base)
- Increase `h2` padding-top from 24px to 32px
- Add `margin-bottom: 8px` to `h3` for more separation
### 4B. Sidebar Styling Enhancement
**File to modify: `/docusaurus/src/scss/sidebar.scss`**
Updates to the existing styles:
- Active item: pill background with `var(--strapi-primary-100)`, plus a left accent bar (3px wide, primary-600, rounded ends). The active item pill already exists (line 127-129 in the current file), enhance it
- Category headers (`.theme-doc-sidebar-item-category-level-1`): uppercase text, `letter-spacing: 0.05em`, `font-size: 11px`, `color: var(--strapi-neutral-400)`
- Hover state: add `background-color: var(--strapi-surface-1)` with border-radius 6px
- Section separators: `border-bottom: 1px solid var(--strapi-neutral-150)` between level-1 categories, with 12px padding
- Increase vertical spacing between items from current 2px padding to 4px
### 4C. Table of Contents Enhancement
**File to modify: `/docusaurus/src/scss/table-of-contents.scss`**
Updates:
- Active indicator: Instead of a static `::before` pseudo-element, use a CSS `transition` on `top` so the bar slides to the active item
- Active item: `color: var(--strapi-primary-600)` + `font-weight: 600`
- Hover: `color: var(--strapi-primary-500)` with `transition: color var(--duration-fast)`
- "On this page" label: use `var(--strapi-font-family-display)`, uppercase, 10px, `letter-spacing: 0.1em`
- Replace the Phosphor font-based icon with a proper `<i class="ph-fill ph-list">` in the component
### 4D. Enhanced Document Header
**File to CREATE: `/docusaurus/src/components/DocHeader/DocHeader.jsx`**
**File to CREATE: `/docusaurus/src/components/DocHeader/doc-header.module.scss`**
An optional enhanced header for doc pages:
- Thin top accent line (2px gradient from primary-600 to primary-200)
- H1 in Inter Tight at 36px (up from current 32px)
- Subtle bottom separator: 1px `var(--strapi-neutral-150)`
This component would be used by modifying the MDX components mapping or by wrapping the doc page layout.
---
## Phase 5: API 2-Column Layout
### 5A. ApiDocLayout Component
**File to CREATE: `/docusaurus/src/components/ApiDocLayout/ApiDocLayout.jsx`**
A compound component providing Stripe-style 2-column API documentation:
```jsx
// Usage in MDX:
// <ApiDocLayout>
//   <ApiDocLayout.Description>
//     ## Create an entry  
//     Creates a new entry...
//   </ApiDocLayout.Description>
//   <ApiDocLayout.Code>
//     ```bash title="Request"
//     POST /api/restaurants
//     ```
//   </ApiDocLayout.Code>
// </ApiDocLayout>
```
Implementation details:
- Uses CSS Grid: `grid-template-columns: 1fr 1fr` with `gap: var(--strapi-spacing-8)`
- Both columns are `position: sticky; top: calc(var(--ifm-navbar-height) + 16px)` so they stick independently during scroll
- The code column has `background: var(--strapi-surface-1)` with `border-radius: var(--strapi-radius-lg)` and `padding: var(--strapi-spacing-4)`
- Breaks to single column at `medium-down` breakpoint (996px, matching existing breakpoint)
- Must override the parent article's `max-width: 720px` -- uses `margin: 0 calc(-1 * var(--strapi-spacing-8))` to break out
**File to CREATE: `/docusaurus/src/components/ApiDocLayout/api-doc-layout.module.scss`**
### 5B. Modify Existing ApiCall
**File to modify: `/docusaurus/src/components/ApiCall.js`**
Add an optional `layout="split"` prop. When set, the component wraps its children in the `ApiDocLayout` grid. Default behavior (stacked layout) is unchanged for backward compatibility.
### 5C. Register in MDX
**File to modify: `/docusaurus/src/theme/MDXComponents.js`**
Import and register `ApiDocLayout` so it is available in all MDX files without explicit imports.
---
## Phase 6: Pretext Integration
### 6A. Installation
**File to modify: `/docusaurus/package.json`**
Add `"pretext": "^latest"` to dependencies. The library is 15KB, well within performance budget.
### 6B. PretextReveal Component
**File to CREATE: `/docusaurus/src/components/PretextReveal/PretextReveal.jsx`**
**File to CREATE: `/docusaurus/src/components/PretextReveal/pretext-reveal.module.scss`**
A component for character-by-character reveal animation on hero text:
1. Accepts `text` (string), `as` (element type, default `h1`), `font` (CSS font string), `className`
2. On mount, calls `prepare(text, font)` to measure text
3. Calls `walkLineRanges(prepared, containerWidth, callback)` to get character positions
4. Renders the text as individual `<span>` elements, each with:
   - `opacity: 0` initially
   - `transform: translateY(8px)` initially
   - Staggered `animation-delay` based on character index (15ms per character)
   - Animation: `opacity 0->1, translateY 8px->0` over 400ms with `ease-out-expo`
5. Also renders a hidden `<span>` with the full text for accessibility and SEO
6. Respects `prefers-reduced-motion`: if reduced, renders static text immediately
7. Uses `ResizeObserver` to re-layout on container width change (calls `layout()` which is cheap)
### 6C. PretextReflow Component
**File to CREATE: `/docusaurus/src/components/PretextReflow/PretextReflow.jsx`**
Uses `layoutNextLine()` with variable widths to flow text around floating elements. Primary use case: the homepage hero description text flowing around a decorative element. This is a more advanced integration that can be deferred to a later iteration.
### 6D. Code Block Height Prediction Hook
**File to CREATE: `/docusaurus/src/hooks/usePretextLayout.js`**
Uses `prepare()` + `layout()` to predict code block heights before rendering, preventing layout shift in the API 2-column layout. The hook:
1. Accepts `text` (code content), `font` (monospace font string), `maxWidth`
2. Returns `{ height, lineCount }`
3. The API 2-column code panel can set `min-height` to the predicted value
---
## Phase 7: Navbar Refinement
**File to modify: `/docusaurus/src/scss/navbar.scss`**
Changes (building on the existing styles):
- Increase `min-height` from 64px to 72px on desktop (line 251 in current file)
- Add backdrop blur on scroll: `backdrop-filter: blur(12px); background: rgba(255,255,255,0.85)` (replaces the inline `<style>` hack in `Home.jsx` lines 77-88)
- Dark mode: `background: rgba(24,24,38,0.85)` with same blur
- Active nav item: Replace background-color with a 2px bottom accent line, animated with `scaleX(0)` to `scaleX(1)` on transition
- Search bar: Increase width from 266px to 300px, `border-radius: var(--strapi-radius-md)`, subtle shadow on focus
- Color mode toggle: Cross-fade transition instead of instant swap (use `opacity` transition on the `::after` pseudo-element)
- Logo: Add subtle opacity transition on hover (0.8 on hover, 1.0 default)
---
## Phase 8: Footer Redesign
**File to modify: `/docusaurus/src/scss/footer.scss`**
Changes:
- Replace the absolute-positioned logo with a proper CSS Grid layout: `grid-template-columns: 200px 1fr`
- Logo in the left column, link columns in the right area
- Subtle top border using a gradient: `border-image: linear-gradient(to right, var(--strapi-primary-200), transparent) 1`
- Link hover: animated underline using `background-image: linear-gradient(currentColor, currentColor)` with `background-size` transition from `0% 1px` to `100% 1px`
- Dark mode: `background-color: var(--strapi-surface-1)` instead of transparent
- Mobile: Stack to single column
---
## Phase 9: Component Polish and New Components
### 9A. Enhanced Admonitions
**File to modify: `/docusaurus/src/scss/admonition.scss`**
- `border-radius: var(--strapi-radius-md)` (10px, up from current)
- Left accent bar: 3px instead of default
- Subtle background gradient from the admonition color-100 to transparent
### 9B. Enhanced Code Blocks
**File to modify: `/docusaurus/src/scss/code-block.scss`**
- `border-radius: var(--strapi-radius-md)` (10px)
- Title bar: Three dots decoration (macOS style) using `::before` pseudo-element with three small circles
- Copy button: pill-shaped, fade-in on hover of the code block
- Line numbers: `color: var(--strapi-neutral-400)`, smaller font
### 9C. GlowCard Component
**File to CREATE: `/docusaurus/src/components/GlowCard/GlowCard.jsx`**
**File to CREATE: `/docusaurus/src/components/GlowCard/glow-card.module.scss`**
A card variant with mouse-tracking glow effect. The card has a `::before` pseudo-element with a `radial-gradient` positioned at `var(--mouse-x)` and `var(--mouse-y)`. On `mousemove`, JavaScript updates these CSS custom properties. The gradient uses `rgba(73, 69, 255, 0.08)` for a subtle primary glow. `opacity: 0` by default, `opacity: 1` on hover. This can be used for the homepage Quick Links or as an alternative card style.
---
## Implementation Sequence
| Phase | Description | Priority | Est. Effort |
|-------|-------------|----------|-------------|
| 0A | Typography system | Critical | 1 day |
| 0B | Color system | Critical | 0.5 day |
| 1A | Animation system | Critical | 0.5 day |
| 1B | Layout spacing | High | 0.5 day |
| 2A | Left sidebar collapse | High | 1 day |
| 2B | Right sidebar collapse | High | 1 day |
| 3A-E | Homepage redesign | High | 2-3 days |
| 4A-D | Doc page refinement | High | 1-2 days |
| 5A-C | API 2-column layout | Medium | 1-2 days |
| 6A-D | Pretext integration | Medium | 1-2 days |
| 7 | Navbar refinement | Medium | 0.5 day |
| 8 | Footer redesign | Low | 0.5 day |
| 9A-C | Component polish | Low | 1-2 days |
Total estimated effort: **12-16 days**
Phases 0 and 1 are prerequisites for everything else. Phase 3 (homepage) and Phase 2 (sidebars) can be done in parallel. Phase 5 (API layout) and Phase 6 (Pretext) are independent and can be done in parallel with each other.
---
## Complete File Inventory
### Files to CREATE (19 new files):
1. `/docusaurus/src/scss/_animations.scss`
2. `/docusaurus/src/hooks/useScrollReveal.js`
3. `/docusaurus/src/theme/DocSidebar/Desktop/index.js`
4. `/docusaurus/src/theme/DocSidebar/Desktop/desktop-sidebar.module.scss`
5. `/docusaurus/src/components/CollapsibleTOC/CollapsibleTOC.jsx`
6. `/docusaurus/src/components/CollapsibleTOC/collapsible-toc.module.scss`
7. `/docusaurus/src/components/HomepageHero/HomepageHero.jsx`
8. `/docusaurus/src/components/HomepageHero/homepage-hero.module.scss`
9. `/docusaurus/src/components/QuickLinks/QuickLinks.jsx`
10. `/docusaurus/src/components/QuickLinks/quick-links.module.scss`
11. `/docusaurus/src/components/DocHeader/DocHeader.jsx`
12. `/docusaurus/src/components/DocHeader/doc-header.module.scss`
13. `/docusaurus/src/components/ApiDocLayout/ApiDocLayout.jsx`
14. `/docusaurus/src/components/ApiDocLayout/api-doc-layout.module.scss`
15. `/docusaurus/src/components/PretextReveal/PretextReveal.jsx`
16. `/docusaurus/src/components/PretextReveal/pretext-reveal.module.scss`
17. `/docusaurus/src/components/PretextReflow/PretextReflow.jsx`
18. `/docusaurus/src/hooks/usePretextLayout.js`
19. `/docusaurus/src/components/GlowCard/GlowCard.jsx` + `glow-card.module.scss`
### Files to MODIFY (32 existing files):
1. `/docusaurus/src/scss/_tokens.scss` -- spacing, radius, surface, shadow, gradient, font tokens
2. `/docusaurus/src/scss/_tokens-overrides.scss` -- updated Infima mappings
3. `/docusaurus/src/scss/_fonts.scss` -- replace Poppins with Inter Tight + Inter
4. `/docusaurus/src/scss/_base.scss` -- wider article, more padding
5. `/docusaurus/src/scss/_mixins.scss` -- add transition variants
6. `/docusaurus/src/scss/__index.scss` -- import animations file
7. `/docusaurus/src/scss/typography.scss` -- new font families, type scale
8. `/docusaurus/src/scss/sidebar.scss` -- enhanced styling + collapse animation
9. `/docusaurus/src/scss/table-of-contents.scss` -- enhanced TOC styling
10. `/docusaurus/src/scss/navbar.scss` -- blur, height, active states
11. `/docusaurus/src/scss/footer.scss` -- grid layout, gradient border
12. `/docusaurus/src/scss/card.scss` -- enhanced card styling
13. `/docusaurus/src/scss/admonition.scss` -- refined admonitions
14. `/docusaurus/src/scss/code-block.scss` -- refined code blocks
15. `/docusaurus/src/scss/api-call.scss` -- support for split layout
16. `/docusaurus/src/scss/ai-toolbar.scss` -- replace hardcoded SF Pro
17. `/docusaurus/src/scss/breadcrumbs.scss` -- refined breadcrumb styling
18. `/docusaurus/src/pages/home/Home.jsx` -- complete homepage restructure
19. `/docusaurus/src/pages/home/home.module.scss` -- homepage redesign
20. `/docusaurus/src/pages/home/_home.content.js` -- new section content
21. `/docusaurus/src/components/Card/Card.jsx` -- enhanced card component
22. `/docusaurus/src/components/Card/card.module.scss` -- replace SF Pro, new styling
23. `/docusaurus/src/components/HomepageAIButton/HomepageAIButton.js` -- redesign as search bar
24. `/docusaurus/src/components/HomepageAIButton/homepageaibutton.module.scss` -- new styling
25. `/docusaurus/src/components/Hero/Hero.jsx` -- enhanced hero
26. `/docusaurus/src/components/Hero/hero.module.scss` -- hero redesign
27. `/docusaurus/src/components/ApiCall.js` -- add layout prop
28. `/docusaurus/src/components/index.js` -- export new components
29. `/docusaurus/src/theme/DocSidebar/index.js` -- enhanced sidebar wrapper
30. `/docusaurus/src/theme/TOC/index.js` -- wrap with collapsible TOC
31. `/docusaurus/src/theme/MDXComponents.js` -- register ApiDocLayout
32. `/docusaurus/package.json` -- add pretext dependency
---
## Risks and Mitigations
1. **Docusaurus CSS specificity conflicts:** Infima uses generic selectors. Mitigation: Use CSS modules for all new components (the existing codebase already follows this pattern). Use the established `_tokens-overrides.scss` pattern for Infima overrides.
2. **Sidebar collapse breaking Docusaurus navigation state:** Mitigation: Only modify visual presentation (CSS width/opacity), not the DOM structure. Docusaurus's internal sidebar state and routing remain unchanged.
3. **Performance with Pretext on low-end devices:** Mitigation: Use Pretext only on the homepage hero (single instance). Guard with `prefers-reduced-motion` media query. Fall back to static text when motion is reduced. The `prepare()` call happens once on mount.
4. **Variable fonts FOIT/FOUT:** Mitigation: Use `display=swap` in the Google Fonts URL. Add `size-adjust` fallback declarations for the system font stack so layout does not shift during font load.
5. **API 2-column layout on mobile:** Mitigation: Grid collapses to single column at `medium-down` breakpoint (996px, consistent with the existing responsive strategy defined in `_mixins.scss`). Code panel stacks below description.
6. **Breaking existing MDX content:** The plan adds no changes to MDX processing. All existing components remain backward-compatible. New features like `ApiDocLayout` are opt-in via explicit MDX usage.
### Critical Files for Implementation
- `/docusaurus/src/scss/_tokens.scss`
- `/docusaurus/src/scss/_fonts.scss`
- `/docusaurus/src/pages/home/Home.jsx`
- `/docusaurus/src/scss/sidebar.scss`
- `/docusaurus/src/sc