Before installing Strapi, the following requirements must be installed on your computer:

- [Node.js](https://nodejs.org): Only Maintenance and LTS versions are supported (`v14`, `v16`, and `v18`).
    - Node v18.x is recommended for Strapi `v4.3.9` and above
    - Node v16.x is recommended for Strapi `v4.0.x` to `v4.3.8`.
- Your preferred Node.js package manager:
    - [npm](https://docs.npmjs.com/cli/v6/commands/npm-install) (`v6` only)
    - [yarn](https://yarnpkg.com/getting-started/install)
- [Python](https://www.python.org/downloads/) (if using a SQLite database)
- A supported database:
    | Database   | Minimum | Recommended |
    |------------|---------|-------------|
    | MySQL      | 5.7.8   | 8.0         |
    | MariaDB    | 10.3    | 10.6        |
    | PostgreSQL | 11.0    | 14.0        |
    | SQLite     | 3       | 3           |

::: caution
Strapi `v4` does not support MongoDB.
:::
