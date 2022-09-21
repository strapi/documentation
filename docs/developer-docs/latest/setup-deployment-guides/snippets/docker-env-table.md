There are several environment variables that are required in order to run Strapi in a Docker container, there are also several [optional variables](/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.md#strapi-s-environment-variables) you can set.

The following environment variables are required:

| Variable name | Description |
|---------------|-------------|
| `NODE_ENV` | The environment in which the application is running. |
| `DATABASE_CLIENT` | The database client to use. |
| `DATABASE_HOST` | The database host. |
| `DATABASE_PORT` | The database port. |
| `DATABASE_NAME` | The database name. |
| `DATABASE_USERNAME` | The database username. |
| `DATABASE_PASSWORD` | The database password. |
| `JWT_SECRET` | The secret used to sign the JWT for the Users-Permissions plugin. |
| `ADMIN_JWT_SECRET` | The secret used to sign the JWT for the Admin panel. |
| `APP_KEYS` | The secret keys used to sign the session cookies. |
