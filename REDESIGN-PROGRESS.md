# Strapi Documentation Redesign — Progress Tracker

**Branch:** `repo/experimental-redesign-spring-2026`
**Started:** April 2026
**Preview server ID:** `ed839a52-8d0e-476e-be07-78ff3b47c697`
**Plan file:** `/Users/piwi/.claude/plans/linear-enchanting-sunbeam.md`

---

## COMPLETED

### 1. Typography & Design Tokens (Phase 0)
- **Fonts:** Replaced Poppins/SF Pro with Inter Tight (headings), Inter (body), JetBrains Mono (code)
- **File:** `src/scss/_fonts.scss` — new Google Fonts imports
- **File:** `src/scss/_tokens.scss` — added surface hierarchy, elevation, radius, gradient, glow, spacing tokens with dark mode counterparts
- **File:** `src/scss/typography.scss` — new font families, negative letter-spacing on headings

### 2. Animation System (Phase 1)
- **New file:** `src/scss/_animations.scss` — custom easings, duration tokens, keyframes (fadeInUp, fadeIn, scaleIn, shimmer), `.reveal` utility, respects `prefers-reduced-motion`
- **New file:** `src/hooks/useScrollReveal.js` — IntersectionObserver-based hook
- **Imported in:** `src/scss/__index.scss`

### 3. Collapsible Left Sidebar (Phase 2)
- **New file:** `src/theme/DocSidebar/Desktop/index.js` + `.module.scss`
- Floating toggle button (32x32 circle) with triangle arrow icons (▶/◀)
- Collapsed: 48px-wide rail
- CSS transition on width with `var(--strapi-duration-slow) var(--strapi-ease)`
- State persisted in `localStorage('strapi-sidebar-collapsed')`
- Sidebar content fades out with opacity transition
- **File:** `src/scss/sidebar.scss` — enhanced active item (pill background + 3px left accent), category headers uppercase

### 4. Collapsible Right Sidebar / TOC (Phase 2)
- **New file:** `src/components/CollapsibleTOC/CollapsibleTOC.jsx` + `.module.scss`
- Toggle button with triangle arrows (▶ when open = "click to collapse right", ◀ when collapsed = "click to expand left")
- Width transition: 240px ↔ 44px using explicit `width/max-width/min-width` properties (NOT flex shorthand — flex shorthand doesn't transition!)
- Sticky positioning with `top: var(--ifm-navbar-height)`, aligned vertically with left sidebar "NAVIGATION" header
- **File:** `src/theme/TOC/index.js` — wrapped with CollapsibleTOC

### 5. Content Layout & Alignment
- **File:** `src/scss/_base.scss` — heavily modified:
  - Container max-width set to `100% !important` (Docusaurus default 1140px was capping layout)
  - `.col--3` uses explicit width properties for smooth transition (not flex shorthand)
  - `.col--3:has(.toc-v3-wrapper--collapsed)` reduces to 44px
  - Pages without TOC get `padding-right: 240px` to align with TOC pages
  - Prose pages: article max-width 720px (~75 chars/line — readability best practice)
  - API pages: `max-width: 100%` — benefit from sidebar collapse expansion (Sanity-style)
  - Smooth transitions when collapsing sidebars — content expands fluidly, no jumps

### 6. Search + Ask AI in Navbar
- **New file:** `src/components/NavbarSearchAI/NavbarSearchAI.jsx` + `.module.scss`
  - Pill-shaped container: Search (left) + divider + Ask AI button (right)
  - Both sides highlight identically on hover (background tint + icon color)
  - Ask AI button has `kapa-widget-button` class to trigger Kapa modal
  - Dark mode support, hidden on mobile
- **File:** `src/theme/Navbar/Content/index.js` — added NavbarSearchAI to right side
- **File:** `src/theme/DocSidebar/index.js` — removed CustomSearchBarWrapper from sidebar

### 7. Homepage Redesign (Phase 3) — COMPLETE
- **File:** `src/pages/home/Home.jsx` — fully redesigned:
  - **REMOVED** old ugly CMS/Cloud product cards
  - **ADDED** 4 categorized explore sections (Sanity/Directus-inspired):
    - Getting Started (Quick Start, Installation, Deploy to Cloud, What's New)
    - Build & Customize (Content-Type Builder, Content Manager, Customization, Plugins)
    - APIs & Integration (REST API, GraphQL, Document Service, TypeScript)
    - Strapi Cloud (Getting Started, Projects, Cloud CLI, Custom Domains)
  - Each section has eyebrow label with line + 4 cards in a row (responsive: 2 col on tablet, 1 on mobile)
  - Each card: Phosphor icon + title + description + hover arrow animation
  - Bento grid (Quick Start) — 5 interactive cards with code blocks
  - **API Explorer** — interactive widget (see below)
- **File:** `src/pages/home/home.module.scss` — replaced productCard styles with explore styles

### 8. API Explorer Component (NEW)
- **New file:** `src/components/ApiExplorer/ApiExplorer.jsx`
  - 3 tabs: REST API, GraphQL, Document Service
  - Endpoint sidebar with method badges (GET=green, POST=yellow, PUT=blue, DELETE=red)
  - URL bar with method pill + path + Send button
  - Simulated loading animation (300-700ms random delay)
  - JSON syntax highlighting via regex (keys=purple, strings=yellow, numbers=green, bools=blue)
  - 5 REST endpoints, 2 GraphQL operations, 3 Document Service methods
  - All with realistic Strapi v5 response data (verified against actual docs)
  - **DELETE returns 204 No Content** with empty body (verified)
  - **POST returns 200 OK** (not 201 — that's Strapi's actual behavior)
  - Doc link below explorer changes dynamically per tab (REST API docs → / GraphQL docs → / Document Service docs →)
- **New file:** `src/components/ApiExplorer/ApiExplorer.module.scss`
  - Dark theme (#1a1a2e background)
  - Responsive: sidebar becomes horizontal scrollable on mobile
  - Loading bar animation, method badge colors, JSON syntax classes

### 9. Navbar & Footer Polish (Phase 7) — PARTIALLY COMPLETE
- **File:** `src/scss/navbar.scss` — backdrop blur on scroll, semi-transparent background
- Footer not yet touched

### 10. Component Polish (Phase 8) — PARTIALLY COMPLETE
- **File:** `src/scss/admonition.scss` — `border-radius: 10px`, 3px left accent bar
- **File:** `src/scss/code-block.scss` — `border-radius: 10px`, macOS-style dots, copy button fade-in on hover

---

## IN PROGRESS / NEEDS VERIFICATION

### Homepage — DONE
- Categorized explore sections render correctly ✅ (4 categories, 16 links total)
- API Explorer renders and is interactive ✅ (tabs switch, Send button works, loading animation plays)
- DELETE endpoint correctly shows 204 No Content ✅
- Doc links below explorer work and change per tab ✅
- **TODO:** Test dark mode on homepage
- **TODO:** Responsive testing of homepage components (mobile)
- **TODO:** Polish bento card hover effects

---

## NOT YET STARTED

### From the Plan (Phases 4-8)

1. **Doc Page Header Component** (Phase 4)
   - `src/components/DocHeader/DocHeader.jsx` + `.module.scss`
   - Thin top accent line (2px gradient), H1 at 36px Inter Tight

2. **API 2-Column Layout** (Phase 5)
   - `src/components/ApiDocLayout/ApiDocLayout.jsx` + `.module.scss`
   - Stripe-style compound component for API docs
   - CSS Grid: `1fr 1fr`, gap 32px, code column sticky
   - Register in `src/theme/MDXComponents.js`

3. **Pretext Integration** (Phase 6)
   - Install `@chenglou/pretext`
   - `src/components/PretextReveal/PretextReveal.jsx` — character reveal animation for hero
   - `src/hooks/usePretextLayout.js` — code height prediction

4. **GlowCard Component**
   - `src/components/GlowCard/GlowCard.jsx` + `.module.scss`
   - Mouse-tracking radial gradient on hover

5. **QuickLinks Component**
   - `src/components/QuickLinks/QuickLinks.jsx` + `.module.scss`
   - 3-column grid of popular pages with animated arrows

6. **Footer Redesign**
   - CSS Grid layout, gradient top border, animated link underlines

7. **Fix Endpoint Content Duplication** (Plan section 11)
   - Remove `<h2>` title from Endpoint component
   - Clean up duplicated markdown descriptions across ~14 API doc files

---

## KEY TECHNICAL DECISIONS & GOTCHAS

### CSS Transition Pitfalls
- **`flex` shorthand doesn't transition.** `flex: 0 0 240px` → `flex: 0 0 44px` snaps instantly. Must use `flex: 0 0 auto` + transition explicit `width/max-width/min-width`.
- **`overflow: hidden` breaks `position: sticky`.** All ancestors must have `overflow: visible`.
- **`margin: auto` can't be CSS-transitioned**, but it recalculates on each frame when parent width transitions.

### Readability
- 720px article width ≈ 75 chars/line (upper limit of optimal 45-75 range)
- 840px ≈ 88 chars (too wide), 960px ≈ 100 chars (way too wide)
- Only API pages (which have structured content, not prose) should expand beyond 720px

### Docusaurus Constraints
- `.container` has default `max-width: 1140px` — must override with `!important`
- Docusaurus controls `.col--3` for TOC column — we override with `:has()` selectors
- Search component is `@theme/SearchBar` — we wrap it, don't replace it

### Kapa AI Integration
- Any element with class `kapa-widget-button` opens the Kapa modal
- Used in NavbarSearchAI's "Ask AI" button

---

## FILE INVENTORY — ALL NEW FILES CREATED

```
src/scss/_animations.scss
src/hooks/useScrollReveal.js
src/theme/DocSidebar/Desktop/index.js
src/theme/DocSidebar/Desktop/index.module.scss
src/components/CollapsibleTOC/CollapsibleTOC.jsx
src/components/CollapsibleTOC/CollapsibleTOC.module.scss
src/components/NavbarSearchAI/NavbarSearchAI.jsx
src/components/NavbarSearchAI/NavbarSearchAI.module.scss
src/components/ApiExplorer/ApiExplorer.jsx
src/components/ApiExplorer/ApiExplorer.module.scss
```

## FILE INVENTORY — MODIFIED FILES

```
src/scss/_fonts.scss
src/scss/_tokens.scss
src/scss/__index.scss
src/scss/_base.scss
src/scss/typography.scss
src/scss/sidebar.scss
src/scss/navbar.scss
src/scss/admonition.scss
src/scss/code-block.scss
src/scss/table-of-contents.scss
src/theme/DocSidebar/index.js
src/theme/TOC/index.js
src/theme/Navbar/Content/index.js
src/pages/home/Home.jsx
src/pages/home/home.module.scss
```

---

## HOW TO RESUME

1. `cd docusaurus && yarn dev` — start dev server on port 8080
2. Check branch: `git checkout repo/experimental-redesign-spring-2026`
3. Start the Claude Preview server if needed for visual verification
4. Continue with "NOT YET STARTED" items above, in order of priority
5. Reference the full plan at `/Users/piwi/.claude/plans/linear-enchanting-sunbeam.md` for detailed specs
