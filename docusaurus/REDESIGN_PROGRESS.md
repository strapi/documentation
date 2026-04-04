# Redesign Progress — Spring 2026

Branch: `repo/experimental-redesign-spring-2026`

This file tracks the progress of the v3 visual redesign. It complements the git history and helps maintain context across long sessions.

## Completed

### Phase 0: Foundation
- [x] Typography tokens (Inter Tight, Inter, JetBrains Mono) — in `_tokens.scss`, `_fonts.scss`, `typography.scss`
- [x] Design tokens expansion (surfaces, elevations, radii, gradients, glow) — in `_tokens.scss`
- [x] Animation system (`_animations.scss`, `useScrollReveal.js`)

### Phase 1: Component Polish
- [x] **Code blocks** (`code-block.scss`): transparent backgrounds in both light/dark, border-radius 10px, macOS title bar dots, enhanced copy button
- [x] **Tabs** (`tabs.scss`): fixed double borders for code blocks inside tabs, proper spacing
- [x] **Admonitions** (`admonition.scss`): transparent background in dark mode only
- [x] **Details/Accordions** (`details.scss`): complete redesign with purple accent bar via `::after`, rounded corners, elegant open/close states
- [x] **Pagination nav** (`pagination-nav.scss`): transparent bg, rounded, hover with primary accent
- [x] **Sidebar collapse button** (`sidebar.scss`): transparent bg, subtle border-top, hover shows primary color
- [x] **Footer** (`footer.scss`): removed gradient accent entirely (both modes)

### Phase 2: Navigation & Progress
- [x] **Reading progress bar** (`src/components/ReadingProgressBar/`): fixed position below navbar, 2px, blue-to-purple gradient with glow, only on doc pages. Uses ref-based DOM updates + RAF for smooth scrolling (no CSS transition flash).
- [x] **Navbar redesign** (`navbar.scss`, `src/theme/Navbar/Content/`): mockup-v3 minimal layout — Logo + vertical separator + monospace breadcrumbs (left), theme toggle (right). CMS/Cloud/GitHub/Contribution items hidden on desktop.
- [x] **Navbar breadcrumbs** (`src/components/NavbarBreadcrumbs/`): monospace path-style breadcrumbs from URL path, 1px vertical separator after logo
- [x] **Standard breadcrumbs hidden** (`breadcrumbs.scss`): replaced by navbar breadcrumbs
- [x] **Product switcher** (`src/components/ProductSwitcher/`): CMS/Cloud dropdown in sidebar top, colored dot indicator, replaces navbar CMS/Cloud links
- [x] **Navbar glass effect** (`navbar.scss`): backdrop-filter blur, semi-transparent bg, active item accent line
- [x] **Root.js** (`src/theme/Root.js`): wraps app with ReadingProgressBar

### Phase 3: Quick Start Guide Gamification
- [x] **StepDetails component** (`src/components/StepDetails/`): custom `<details>` replacement with localStorage-based completion tracking, Phosphor checkmark icons
- [x] **QSG converted** (`docs/cms/quick-start.md`): all 6 steps use `<StepDetails>`, duplicate H2/H3 headings removed, nested `<details>` preserved, TOC navigation via `id` attributes
- [x] **Registered in MDXComponents.js** for global availability

### Phase 4: Bug Fixes & Polish (session 2)
- [x] **Mobile sidebar fix** (`navbar.scss`): `backdrop-filter` on `<nav>` was creating a new containing block for `position: fixed` children, constraining sidebar to 55px height. Fixed with explicit `height: 100dvh`.
- [x] **Progress bar positioning** (`ReadingProgressBar.module.scss`): moved to `top: 0; z-index: 201` to render above the navbar glass effect (z-index 200). Increased to 3px height.
- [x] **Card styling** (`card.scss`, `card.module.scss`): transparent background, no box-shadow at rest, subtle `translateY(-2px)` + light shadow on hover for relief effect (matching docs.strapi.io).
- [x] **Cloud Docs link fix** (`ProductSwitcher.jsx`): changed from `/cloud/getting-started/intro` (404) to `/cloud/intro`.
- [x] **Sidebar spacing** (`sidebar.scss`, `custom-search-bar.scss`): reduced gaps between ProductSwitcher, Search/Ask AI, and nav items.

## In Progress / Not Yet Started

### From the Plan (see `.claude/plans/linear-enchanting-sunbeam.md`)
- [ ] Homepage redesign (HomepageHero, QuickLinks, GlowCard, AI search bar restyle)
- [ ] Collapsible sidebars (left + right TOC)
- [ ] API 2-column layout (ApiDocLayout — component exists but not widely used)
- [ ] DocHeader component (accent line, refined H1)
- [ ] Pretext integration (character reveal animation)

## Key Files Modified

| File | What changed |
|------|-------------|
| `src/scss/_tokens.scss` | Surface, elevation, radius, gradient, glow tokens |
| `src/scss/code-block.scss` | Transparent bg, radius, title bar dots |
| `src/scss/tabs.scss` | Fixed double borders in code blocks |
| `src/scss/details.scss` | Redesigned accordions with `::after` accent |
| `src/scss/admonition.scss` | Dark mode transparent bg |
| `src/scss/pagination-nav.scss` | Redesigned prev/next buttons |
| `src/scss/sidebar.scss` | Collapse button restyle |
| `src/scss/footer.scss` | Removed gradient accent |
| `src/scss/navbar.scss` | Minimal layout, hidden nav items on desktop, glass effect, mobile sidebar fix (height: 100dvh) |
| `src/scss/card.scss` | Transparent bg, subtle hover relief |
| `src/components/Card/card.module.scss` | Transparent bg, hover translateY + shadow |
| `src/scss/breadcrumbs.scss` | Hidden (replaced by navbar crumbs) |
| `src/theme/Root.js` | ReadingProgressBar wrapper |
| `src/theme/Navbar/Content/index.js` | Swizzled: breadcrumbs + minimal right side |
| `src/theme/DocSidebar/index.js` | Added ProductSwitcher above search |
| `src/theme/MDXComponents.js` | Added StepDetails, ApiDocLayout, Endpoint |
| `src/components/ReadingProgressBar/` | New: ref-based scroll progress bar |
| `src/components/NavbarBreadcrumbs/` | New: monospace navbar-style breadcrumbs |
| `src/components/ProductSwitcher/` | New: CMS/Cloud sidebar dropdown switcher |
| `src/components/StepDetails/` | New: gamified details with checkmarks |
| `docs/cms/quick-start.md` | Converted to StepDetails, removed duplicate headings |

## Known Issues
- Preview tool renders black after programmatic scroll (tool limitation, not a bug)
- `llms-full.txt` auto-changes on build — don't include in commits unless intended
