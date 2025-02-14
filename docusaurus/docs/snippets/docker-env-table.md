The following environment variables are required in order to run Strapi in a Docker container:

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

You can also set some [optional environment variables](/cms/configurations/environment#strapi).
