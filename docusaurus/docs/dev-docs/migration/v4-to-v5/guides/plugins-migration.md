---
title: Plugins migration reference
displayed_sidebar: devDocsMigrationV5Sidebar
---

# Plugins migration FAQ

This page is intended to be used as a recap of everything to consider in Strapi 5 if you are a plugin developer intending to migrate your plugin from Strapi v4 to Strapi 5.

## Back end changes

- The Entity Service API from Strapi v4 is deprecated and Strapi 5 uses the Document Service API instead. There is a [migration guide](/dev-docs/migration/v4-to-v5/guides/from-entity-service-to-document-service) for this.
- [Breaking changes](/dev-docs/migration/v4-to-v5/breaking-changes) might apply.
- You can use the new [Plugin CLI](/dev-docs/plugins/guides/use-the-plugin-cli) to generate plugins and publish them on NPM and/or submit them to the Marketplace.
    
## Front-end changes

    - Frontend Changes
        - Design System?
            - Not big changes visually (icons change)
            - Can use v1 or v2 (advise using v2)
            - Migration guide will exist
            - Removed a couple but they were deprecated for a long time
            - Breaking changes are in root of design system → moved into storybook later
        - New APIs, all the normal breaking changes apply
        - Helper plugin deprecated
            - Has migration guide, in the repo for now → Piwi added to docs-next https://docs-next.strapi.io/dev-docs/migration/v4-to-v5/guides/helper-plugin
            - Most have been moved to @strapi/admin
            - Some were removed
        - Aliasing dependencies → if not declared it will use ours (probably)
        - Most everything is in the breaking change list (layouts, hooks, ect)
    - General changes
        - Building and packaging?
            - They don’t have to do it (not tested)
            - Recommended as a best practices (from npm)
        - Pack up?
            - Not required
            - Is pack up specific to our packages or is it universal
                - More for libraries
            - Does the plugin need to be a TS one to use pack up (honestly no idea what pack up does)
        - peerDepend requirement?
            - Yes probably (ask emilie)
            - As a peerDepend
- Do we have an examples of plugins we have converted that could be reviewed?
    - i18n → might be good for frontend, backend would be complicated (changed a ton)
        - Cause of most of the breaking changes, using as an example would not be ideal
    - review workflows → no v4 counterpart on it’s on own
- Whats our plan for the following?
    - https://github.com/strapi/strapi/tree/v5/main/packages/plugins/color-picker
    - https://github.com/strapi/strapi/tree/v5/main/packages/plugins/sentry
    - https://github.com/strapi/strapi-plugin-seo
        - A lot of bad practice before we share it (after migrated) → need refactoring on the admin
- What about custom providers?
    - Does email/upload providers need any conversion?
        - Mainly just getting rid of entityService → docsrv/queries
