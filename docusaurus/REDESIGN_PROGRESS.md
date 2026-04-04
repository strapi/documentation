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
- [x] **Reading progress bar** (`src/components/ReadingProgressBar/`): fixed position below navbar, 2px, blue-to-purple gradient with glow, only on doc pages
- [x] **Navbar breadcrumbs** (`src/components/NavbarBreadcrumbs/`): monospace path-style breadcrumbs inside the navbar (mockup-v3 style), swizzled `Navbar/Content`
- [x] **Standard breadcrumbs hidden** (`breadcrumbs.scss`): replaced by navbar breadcrumbs
- [x] **Navbar glass effect** (`navbar.scss`): backdrop-filter blur, semi-transparent bg, active item accent line
- [x] **Root.js** (`src/theme/Root.js`): wraps app with ReadingProgressBar

### Phase 3: Quick Start Guide Gamification
- [x] **StepDetails component** (`src/components/StepDetails/`): custom `<details>` replacement with localStorage-based completion tracking, Phosphor checkmark icons
- [x] **QSG converted** (`docs/cms/quick-start.md`): all 6 steps use `<StepDetails>`, duplicate H2/H3 headings removed, nested `<details>` preserved, TOC navigation via `id` attributes
- [x] **Registered in MDXComponents.js** for global availability

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
| `src/scss/navbar.scss` | Glass effect, active accent line |
| `src/scss/breadcrumbs.scss` | Hidden (replaced by navbar crumbs) |
| `src/theme/Root.js` | ReadingProgressBar wrapper |
| `src/theme/Navbar/Content/index.js` | Swizzled to add breadcrumbs |
| `src/theme/MDXComponents.js` | Added StepDetails, ApiDocLayout, Endpoint |
| `src/components/ReadingProgressBar/` | New: scroll progress bar |
| `src/components/NavbarBreadcrumbs/` | New: navbar-style breadcrumbs |
| `src/components/StepDetails/` | New: gamified details with checkmarks |
| `docs/cms/quick-start.md` | Converted to StepDetails, removed duplicate headings |

## Known Issues
- Preview tool renders black after programmatic scroll (tool limitation, not a bug)
- `llms-full.txt` auto-changes on build — don't include in commits unless intended
