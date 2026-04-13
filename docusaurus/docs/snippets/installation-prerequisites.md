Before installing Strapi, the following requirements must be installed on your computer:

- <ExternalLink to="https://nodejs.org" text="Node.js"/>: Only <ExternalLink to="https://nodejs.org/en/about/previous-releases" text="Active LTS or Maintenance LTS versions"/> are supported (currently `v20`, `v22`, and `v24`). Odd-number releases of Node, known as "current" versions of Node.js, are not supported (e.g. v23, v25).
- Your preferred Node.js package manager:
    - <ExternalLink to="https://docs.npmjs.com/cli/v6/commands/npm-install" text="npm"/> (`v6` and above)
    - <ExternalLink to="https://yarnpkg.com/getting-started/install" text="yarn"/>
    - <ExternalLink to="https://pnpm.io/" text="pnpm" />
- <ExternalLink to="https://www.python.org/downloads/" text="Python"/> (if using a SQLite database)
- A supported web browser: The Admin panel targets browsers matching the default <ExternalLink to="https://github.com/browserslist/browserslist" text="Browserslist"/> query: `last 3 major versions`, `Firefox ESR`, `last 2 Opera versions`, and `not dead`. See <ExternalLink to="https://browsersl.ist/#q=last+3+major+versions%2C+Firefox+ESR%2C+last+2+Opera+versions%2C+not+dead" text="browsersl.ist"/> for the current coverage matrix. Projects can override these defaults with a Browserslist configuration at the project root.
