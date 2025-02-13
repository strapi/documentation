/**
 * Warning! We have 2 different redirection files
 * We use the present file for most redirections, but some aren't supported by Docusaurus;
 * anything with a #, a %, or any other thing considered as a query parmeter
 * is only supported by Vercel. So these redirections should be done through
 * the redirects object of the vercel.json file.
 * Anything else is declared here.
 * So basically:
 *  - this file = most redirections
 *  - vercel.json = exceptions
 */
module.exports = [
  // "latest" (old docs, VuePress time)
  {
    "from": "/developer-docs/latest/getting-started/quick-start.html%23_1-install-strapi-and-create-a-new-project",
    "to": "/dev-docs/quick-start"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/installation/digitalocean-one-click.html",
    "to": "https://strapi.io/integrations/digital-ocean"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/installation/digitalocean-one-click",
    "to": "https://strapi.io/integrations/digital-ocean"
  },
  {
    "from": "/developer-docs/latest/getting-started/introduction.html",
    "to": "/dev-docs/intro"
  },
  {
    "from": "/developer-docs/latest/guides/auth-request.html",
    "to": "/dev-docs/intro"
  },
  {
    "from": "/developer-docs/latest/development/admin-customization.html",
    "to": "/dev-docs/admin-panel-customization"
  },
  {
    "from": "/developer-docs/latest/development/backend-customization/webhooks.html",
    "to": "/dev-docs/backend-customization/webhooks"
  },
  {
    "from": "/developer-docs/latest/development/backend-customization/policies.html",
    "to": "/dev-docs/backend-customization/policies"
  },
  {
    "from": "/developer-docs/latest/development/backend-customization/routes.html",
    "to": "/dev-docs/backend-customization/routes"
  },
  {
    "from": "/developer-docs/latest/development/backend-customization/middlewares.html",
    "to": "/dev-docs/backend-customization/middlewares"
  },
  {
    "from": "/developer-docs/latest/development/backend-customization/models.html",
    "to": "/dev-docs/backend-customization/models"
  },
  {
    "from": "/developer-docs/latest/development/backend-customization/requests-responses.html",
    "to": "/dev-docs/backend-customization/requests-responses"
  },
  {
    "from": "/developer-docs/latest/development/backend-customization/services.html",
    "to": "/dev-docs/backend-customization/services"
  },
  {
    "from": "/developer-docs/latest/development/backend-customization/controllers.html",
    "to": "/dev-docs/backend-customization/controllers"
  },
  {
    "from": "/developer-docs/latest/development/backend-customization",
    "to": "/dev-docs/backend-customization"
  },
  {
    "from": "/developer-docs/latest/development/backend-customization.html",
    "to": "/dev-docs/backend-customization"
  },
  {
    "from": "/developer-docs/latest/developer-resources/cli/CLI.html",
    "to": "/dev-docs/cli"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/configurations/required/server.html",
    "to": "/dev-docs/configurations/server"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/configurations/required/databases.html",
    "to": "/dev-docs/configurations/database"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/configurations/optional/admin-panel.html",
    "to": "/dev-docs/configurations/admin-panel"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/configurations/required/admin-panel.html",
    "to": "/dev-docs/configurations/admin-panel"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/configurations/optional/typescript.html",
    "to": "/dev-docs/configurations/typescript"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.html",
    "to": "/dev-docs/configurations/middlewares"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/configurations/optional/plugins.html",
    "to": "/dev-docs/configurations/plugins"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/configurations/optional/public-assets.html",
    "to": "/dev-docs/configurations/guides/public-assets"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/configurations/optional/api-tokens.html",
    "to": "/user-docs/features/api-tokens"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/configurations/optional/functions.html",
    "to": "/dev-docs/configurations/functions"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.html",
    "to": "/dev-docs/configurations/environment"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/configurations/optional/sso.html",
    "to": "/dev-docs/configurations/guides/configure-sso"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/configurations/optional/cronjobs.html",
    "to": "/dev-docs/configurations/cron"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/configurations/optional/rbac.html",
    "to": "/dev-docs/configurations/guides/rbac"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/configurations/optional/api.html",
    "to": "/dev-docs/configurations/api"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/configurations.html",
    "to": "/dev-docs/configurations"
  },
  {
    "from": "/user-docs/latest/content-types-builder/introduction-to-content-types-builder.html",
    "to": "/user-docs/content-type-builder"
  },
  {
    "from": "/developer-docs/latest/development/custom-fields",
    "to": "/dev-docs/custom-fields"
  },
  {
    "from": "/developer-docs/latest/developer-resources/data-management.html",
    "to": "/user-docs/features/data-management"
  },
  {
    "from": "/developer-docs/latest/developer-resources/database-migrations.html",
    "to": "/dev-docs/database-migrations"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/digitalocean.html",
    "to": "/dev-docs/deployment/digitalocean"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/digitalocean-app-platform.html",
    "to": "https://strapi.io/integrations/digital-ocean"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/google-app-engine.html",
    "to": "https://forum.strapi.io/t/strapi-v4-on-google-app-engine/28629"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/heroku.html",
    "to": "https://strapi.io/integrations/heroku"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/amazon-aws.html",
    "to": "https://strapi.io/integrations/aws"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/azure.html",
    "to": "https://strapi.io/integrations/azure"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/deployment/optional-software/process-manager.html",
    "to": "https://forum.strapi.io/t/how-to-use-pm2-process-manager-with-strapi/"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/deployment/optional-software/nginx-proxy.html",
    "to": "https://forum.strapi.io/t/nginx-proxing-with-strapi/"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/deployment/optional-software/haproxy-proxy.html",
    "to": "https://forum.strapi.io/t/haproxy-proxying-with-strapi/"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/deployment/optional-software/caddy-proxy.html",
    "to": "https://forum.strapi.io/t/caddy-proxying-with-strapi/"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/deployment/strapi-cloud.html",
    "to": "/dev-docs/deployment/strapi-cloud"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/deployment.html",
    "to": "/dev-docs/deployment"
  },
  {
    "from": "/developer-docs/latest/developer-resources/database-apis-reference/entity-service/populate.html",
    "to": "/dev-docs/api/entity-service/populate"
  },
  {
    "from": "/developer-docs/latest/developer-resources/database-apis-reference/entity-service/components-dynamic-zones.html",
    "to": "/dev-docs/api/entity-service/components-dynamic-zones"
  },
  {
    "from": "/developer-docs/latest/developer-resources/database-apis-reference/entity-service/filter.html",
    "to": "/dev-docs/api/entity-service/filter"
  },
  {
    "from": "/developer-docs/latest/developer-resources/database-apis-reference/entity-service/crud.html",
    "to": "/dev-docs/api/entity-service/crud"
  },
  {
    "from": "/developer-docs/latest/developer-resources/database-apis-reference/entity-service/order-pagination.html",
    "to": "/dev-docs/api/entity-service/order-pagination"
  },
  {
    "from": "/developer-docs/latest/developer-resources/database-apis-reference/entity-service-api.html",
    "to": "/dev-docs/api/entity-service"
  },
  {
    "from": "/developer-docs/latest/development/error-handling.html",
    "to": "/dev-docs/error-handling"
  },
  {
    "from": "/developer-docs/latest/developer-resources/error-handling.html",
    "to": "/dev-docs/error-handling"
  },
  {
    "from": "/developer-docs/latest/getting-started/introduction",
    "to": "/"
  },
  {
    "from": "/developer-docs/latest/getting-started/introduction.html",
    "to": "/"
  },
  {
    "from": "/developer-docs/latest/getting-started/troubleshooting.html",
    "to": "/dev-docs/faq"
  },
  {
    "from": "/developer-docs/latest/getting-started/usage-information.html",
    "to": "/dev-docs/usage-information"
  },
  {
    "from": "/developer-docs/latest/developer-resources/global-strapi/api-reference.html",
    "to": "/dev-docs/cli"
  },
  {
    "from": "/developer-docs/latest/developer-resources/database-apis-reference/graphql-api.html",
    "to": "/dev-docs/api/graphql"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/installation/docker.html",
    "to": "/dev-docs/installation/docker"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/installation/cli.html",
    "to": "/dev-docs/installation/cli"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/installation.html",
    "to": "/dev-docs/installation"
  },
  {
    "from": "/developer-docs/latest/developer-resources/content-api/integrations/gridsome.html",
    "to": "/dev-docs/integrations/gridsome"
  },
  {
    "from": "/developer-docs/latest/developer-resources/content-api/integrations/react.html",
    "to": "/dev-docs/integrations/react"
  },
  {
    "from": "/developer-docs/latest/developer-resources/content-api/integrations/vue-js.html",
    "to": "/dev-docs/integrations/vue-js"
  },
  {
    "from": "/developer-docs/latest/developer-resources/content-api/integrations/svelte.html",
    "to": "/dev-docs/integrations/svelte"
  },
  {
    "from": "/developer-docs/latest/developer-resources/content-api/integrations/sapper.html",
    "to": "/dev-docs/integrations/sapper"
  },
  {
    "from": "/developer-docs/latest/developer-resources/content-api/integrations/gatsby.html",
    "to": "/dev-docs/integrations/gatsby"
  },
  {
    "from": "/developer-docs/latest/developer-resources/content-api/integrations/ruby.html",
    "to": "/dev-docs/integrations/ruby"
  },
  {
    "from": "/developer-docs/latest/developer-resources/content-api/integrations/python.html",
    "to": "/dev-docs/integrations/python"
  },
  {
    "from": "/developer-docs/latest/developer-resources/content-api/integrations/php.html",
    "to": "/dev-docs/integrations/php"
  },
  {
    "from": "/developer-docs/latest/developer-resources/content-api/integrations/next-js.html",
    "to": "/dev-docs/integrations/next-js"
  },
  {
    "from": "/developer-docs/latest/developer-resources/content-api/integrations/nuxt-js.html",
    "to": "/dev-docs/integrations/nuxt-js"
  },
  {
    "from": "/developer-docs/latest/developer-resources/content-api/integrations/laravel.html",
    "to": "/dev-docs/integrations/laravel"
  },
  {
    "from": "/developer-docs/latest/developer-resources/content-api/integrations/jekyll.html",
    "to": "/dev-docs/integrations/jekyll"
  },
  {
    "from": "/developer-docs/latest/developer-resources/content-api/integrations/graphql.html",
    "to": "/dev-docs/integrations/graphql"
  },
  {
    "from": "/developer-docs/latest/developer-resources/content-api/integrations/go.html",
    "to": "/dev-docs/integrations/go"
  },
  {
    "from": "/developer-docs/latest/developer-resources/content-api/integrations/flutter.html",
    "to": "/dev-docs/integrations/flutter"
  },
  {
    "from": "/developer-docs/latest/developer-resources/content-api/integrations/dart.html",
    "to": "/dev-docs/integrations/dart"
  },
  {
    "from": "/developer-docs/latest/developer-resources/content-api/integrations/angular.html",
    "to": "/dev-docs/integrations/angular"
  },
  {
    "from": "/developer-docs/latest/developer-resources/content-api/integrations/11ty.html",
    "to": "/dev-docs/integrations/11ty"
  },
  {
    "from": "/developer-docs/latest/developer-resources/content-api/integrations.html",
    "to": "/dev-docs/integrations"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/update-version.html",
    "to": "/dev-docs/upgrades"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides.html",
    "to": "/dev-docs/upgrades"
  },
  {
    "from": "/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.html",
    "to": "/dev-docs/plugins/admin-panel-api"
  },
  {
    "from": "/developer-docs/latest/developer-resources/plugin-api-reference/server.html",
    "to": "/dev-docs/plugins/server-api"
  },
  {
    "from": "/developer-docs/latest/plugins/email.html",
    "to": "/dev-docs/plugins/email"
  },
  {
    "from": "/developer-docs/latest/plugins/users-permissions.html",
    "to": "/dev-docs/plugins/users-permissions"
  },
  {
    "from": "/developer-docs/latest/plugins/documentation.html",
    "to": "/dev-docs/plugins/documentation"
  },
  {
    "from": "/developer-docs/latest/plugins/upload.html",
    "to": "/dev-docs/plugins/upload"
  },
  {
    "from": "/developer-docs/latest/plugins/sentry.html",
    "to": "/dev-docs/plugins/sentry"
  },
  {
    "from": "/developer-docs/latest/plugins/graphql.html",
    "to": "/dev-docs/plugins/graphql"
  },
  {
    "from": "/developer-docs/latest/plugins/i18n.html",
    "to": "/user-docs/features/internationalization"
  },
  {
    "from": "/developer-docs/latest/development/plugins-development.html",
    "to": "/dev-docs/plugins/developing-plugins"
  },
  {
    "from": "/developer-docs/latest/development/plugins-extension.html",
    "to": "/dev-docs/plugins-extension"
  },
  {
    "from": "/developer-docs/latest/plugins/plugins.html",
    "to": "/dev-docs/plugins"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/file-structure",
    "to": "/dev-docs/project-structure"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/file-structure.html",
    "to": "/dev-docs/project-structure"
  },
  {
    "from": "/developer-docs/latest/development/providers.html",
    "to": "/dev-docs/providers"
  },
  {
    "from": "/developer-docs/latest/developer-resources/database-apis-reference/query-engine/filtering.html",
    "to": "/dev-docs/api/query-engine/filtering"
  },
  {
    "from": "/developer-docs/latest/developer-resources/database-apis-reference/query-engine/order-pagination.html",
    "to": "/dev-docs/api/query-engine/order-pagination"
  },
  {
    "from": "/developer-docs/latest/developer-resources/database-apis-reference/query-engine/populating.html",
    "to": "/dev-docs/api/query-engine/populating"
  },
  {
    "from": "/developer-docs/latest/developer-resources/database-apis-reference/query-engine/single-operations.html",
    "to": "/dev-docs/api/query-engine/single-operations"
  },
  {
    "from": "/developer-docs/latest/developer-resources/database-apis-reference/query-engine/bulk-operations.html",
    "to": "/dev-docs/api/query-engine/bulk-operations"
  },
  {
    "from": "/developer-docs/latest/developer-resources/database-apis-reference/query-engine-api.html",
    "to": "/dev-docs/api/query-engine"
  },
  {
    "from": "/developer-docs/latest/getting-started/quick-start",
    "to": "/dev-docs/quick-start"
  },
  {
    "from": "/developer-docs/latest/getting-started/quick-start.html",
    "to": "/dev-docs/quick-start"
  },
  {
    "from": "/developer-docs/latest/developer-resources/database-apis-reference/rest-api.html",
    "to": "/dev-docs/api/rest"
  },
  {
    "from": "/developer-docs/latest/developer-resources/database-apis-reference/rest/api-parameters.html",
    "to": "/dev-docs/api/rest/parameters"
  },
  {
    "from": "/developer-docs/latest/developer-resources/database-apis-reference/rest/filtering-locale-publication.html",
    "to": "/dev-docs/api/rest/filters-locale-publication"
  },
  {
    "from": "/developer-docs/latest/developer-resources/database-apis-reference/rest/populating-fields.html",
    "to": "/dev-docs/api/rest/populate-select"
  },
  {
    "from": "/developer-docs/latest/developer-resources/database-apis-reference/rest/relations.html",
    "to": "/dev-docs/api/rest/relations"
  },
  {
    "from": "/developer-docs/latest/developer-resources/database-apis-reference/rest/sort-pagination.html",
    "to": "/dev-docs/api/rest/sort-pagination"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/installation/templates.html",
    "to": "/dev-docs/templates"
  },
  {
    "from": "/developer-docs/latest/development/typescript.html",
    "to": "/dev-docs/typescript"
  },
  {
    "from": "/developer-docs/latest/developer-resources/unit-testing.html",
    "to": "/dev-docs/testing"
  },
  {
    "from": "/user-docs/latest/users-roles-permissions/managing-administrators.html",
    "to": "/user-docs/users-roles-permissions/managing-administrators.html"
  },
  {
    "from": "/user-docs/latest/users-roles-permissions/managing-end-users.html",
    "to": "/user-docs/users-roles-permissions/managing-end-users"
  },
  {
    "from": "/user-docs/latest/users-roles-permissions/introduction-to-users-roles-permissions.html",
    "to": "/user-docs/users-roles-permissions/introduction-to-users-roles-permissions"
  },
  {
    "from": "/user-docs/latest/users-roles-permissions/configuring-end-users-roles.html",
    "to": "/user-docs/users-roles-permissions/configuring-end-users-roles"
  },
  {
    "from": "/user-docs/latest/users-roles-permissions/configuring-administrator-roles.html",
    "to": "/user-docs/users-roles-permissions/configuring-administrator-roles"
  },
  {
    "from": "/user-docs/latest/settings/managing-global-settings.html",
    "to": "/user-docs/settings/managing-global-settings"
  },
  {
    "from": "/user-docs/latest/settings/configuring-users-permissions-plugin-settings.html",
    "to": "/user-docs/settings/configuring-users-permissions-plugin-settings"
  },
  {
    "from": "/user-docs/latest/settings/audit-logs.html",
    "to": "/user-docs/settings/audit-logs"
  },
  {
    "from": "/user-docs/latest/plugins/strapi-plugins.html",
    "to": "/user-docs/plugins/strapi-plugins"
  },
  {
    "from": "/user-docs/latest/plugins/introduction-to-plugins.html",
    "to": "/user-docs/plugins/introduction-to-plugins"
  },
  {
    "from": "/user-docs/latest/plugins/installing-plugins-via-marketplace.html",
    "to": "/user-docs/plugins/installing-plugins-via-marketplace"
  },
  {
    "from": "/user-docs/latest/media-library/organizing-assets-with-folders.html",
    "to": "/user-docs/media-library/organizing-assets-with-folders"
  },
  {
    "from": "/user-docs/latest/media-library/managing-assets.html",
    "to": "/user-docs/media-library/managing-assets"
  },
  {
    "from": "/user-docs/latest/media-library/introduction-to-media-library.html",
    "to": "/user-docs/media-library/introduction-to-media-library"
  },
  {
    "from": "/user-docs/latest/media-library/adding-assets.html",
    "to": "/user-docs/media-library/adding-assets"
  },
  {
    "from": "/user-docs/latest/content-manager/configuring-view-of-content-type.html",
    "to": "/user-docs/content-manager/configuring-view-of-content-type"
  },
  {
    "from": "/user-docs/latest/getting-started/introduction.html",
    "to": "/user-docs/getting-started/introduction"
  },
  {
    "from": "/user-docs/latest/content-types-builder/managing-content-types.html",
    "to": "/user-docs/content-types-builder/managing-content-types"
  },
  {
    "from": "/user-docs/latest/content-types-builder/introduction-to-content-types-builder.html",
    "to": "/user-docs/content-types-builder/introduction-to-content-types-builder"
  },
  {
    "from": "/user-docs/latest/content-types-builder/creating-new-content-type.html",
    "to": "/user-docs/content-types-builder/creating-new-content-type"
  },
  {
    "from": "/user-docs/latest/content-types-builder/configuring-fields-content-type.html",
    "to": "/user-docs/content-types-builder/configuring-fields-content-type"
  },
  {
    "from": "/user-docs/latest/content-manager/writing-content.html",
    "to": "/user-docs/content-manager/writing-content"
  },
  {
    "from": "/user-docs/latest/content-manager/translating-content.html",
    "to": "/user-docs/content-manager/translating-content"
  },
  {
    "from": "/user-docs/latest/content-manager/saving-and-publishing-content.html",
    "to": "/user-docs/content-manager/saving-and-publishing-content"
  },
  {
    "from": "/user-docs/latest/content-manager/managing-relational-fields.html",
    "to": "/user-docs/content-manager/managing-relational-fields"
  },
  {
    "from": "/user-docs/latest/content-manager/introduction-to-content-manager.html",
    "to": "/user-docs/content-manager/introduction-to-content-manager"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin/enable-plugin.html",
    "to": "/dev-docs/migration/v3-to-v4/plugin/enable-plugin"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin/update-folder-structure.html",
    "to": "/dev-docs/migration/v3-to-v4/plugin/update-folder-structure"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin/migrate-back-end.html",
    "to": "/dev-docs/migration/v3-to-v4/plugin/update-folder-structure"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin/migrate-front-end.html",
    "to": "/dev-docs/migration/v3-to-v4/plugin/update-folder-structure"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin-migration.html",
    "to": "/dev-docs/migration/v3-to-v4/plugin-migration"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code-migration.html",
    "to": "/dev-docs/migration/v3-to-v4/code-migration"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/content-type-schema.html",
    "to": "/dev-docs/migration/v3-to-v4/code-migration/backend/content-type-schema"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/theming.html",
    "to": "/dev-docs/migration/v3-to-v4/code/theming"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/strapi-global.html",
    "to": "/dev-docs/migration/v3-to-v4/code/strapi-global"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend.html",
    "to": "/dev-docs/migration/v3-to-v4/code/frontend"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/services.html",
    "to": "/dev-docs/migration/v3-to-v4/code/services"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/routes.html",
    "to": "/dev-docs/migration/v3-to-v4/code/routes"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/route-middlewares.html",
    "to": "/dev-docs/migration/v3-to-v4/code/route-middlewares"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/policies.html",
    "to": "/dev-docs/migration/v3-to-v4/code/policies"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/graphql.html",
    "to": "/dev-docs/migration/v3-to-v4/code/graphql"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/global-middlewares.html",
    "to": "/dev-docs/migration/v3-to-v4/code/global-middlewares"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/dependencies.html",
    "to": "/dev-docs/migration/v3-to-v4/code/dependencies"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/controllers.html",
    "to": "/dev-docs/migration/v3-to-v4/code/controllers"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/configuration.html",
    "to": "/dev-docs/migration/v3-to-v4/code/configuration"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/translations.html",
    "to": "/dev-docs/migration/v3-to-v4/code/translations"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/data/mongo-sql-cheatsheet.html",
    "to": "/dev-docs/migration/v3-to-v4/data/mongo-sql-cheatsheet"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/data-migration.html",
    "to": "/dev-docs/migration/v3-to-v4/data-migration"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/wysiwyg.html",
    "to": "/dev-docs/migration/v3-to-v4/code/wysiwyg"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/webpack.html",
    "to": "/dev-docs/migration/v3-to-v4/code/webpack"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/data/sql.html",
    "to": "/dev-docs/migration/v3-to-v4/data/sql"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/data/sql-relations.html",
    "to": "/dev-docs/migration/v3-to-v4/data/sql-relations"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/data/mongo.html",
    "to": "/dev-docs/migration/v3-to-v4/data/mongo"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend.html",
    "to": "/dev-docs/migration/v3-to-v4/code-migration"
  },
  {
    "from": "/developer-docs/latest/concepts/draft-and-publish.html",
    "to": "/user-docs/content-manager/saving-and-publishing-content"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.7.4-to-alpha.8.html",
    "to": "/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.8-to-alpha.9.html",
    "to": "/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.9-to-alpha.10.html",
    "to": "/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-beta.15-to-beta.16.html",
    "to": "/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-beta.16-to-beta.17.4.html",
    "to": "/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-beta.17-to-beta.18.html",
    "to": "/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-beta.18-to-beta.19.html",
    "to": "/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-beta.19-to-beta.19.4.html",
    "to": "/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-beta.19-to-beta.20.html",
    "to": "/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-beta.20-to-3.0.0.html",
    "to": "/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/configurations/optional/api-tokens.html",
    "to": "/dev-docs/configurations/api-tokens"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/configurations/optional/sso.html",
    "to": "/dev-docs/configurations/sso"
  },
  {
    "from": "/developer-docs/latest/developer-resources/data-management.html",
    "to": "/dev-docs/data-management"
  },
  {
    "from": "/developer-docs/latest/plugins/i18n.html",
    "to": "/dev-docs/i18n"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin/enable-plugin.html",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/plugin/enable-plugin"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin/update-folder-structure.html",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/plugin/update-folder-structure"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin/migrate-back-end.html",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/plugin/update-folder-structure"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin/migrate-front-end.html",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/plugin/update-folder-structure"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/plugin-migration.html",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/plugin-migration"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code-migration.html",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code-migration"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/content-type-schema.html",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code-migration/backend/content-type-schema"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/theming.html",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/theming"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/strapi-global.html",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/strapi-global"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend.html",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/frontend"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/services.html",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/services"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/routes.html",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/routes"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/route-middlewares.html",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/route-middlewares"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/policies.html",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/policies"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/graphql.html",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/graphql"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/global-middlewares.html",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/global-middlewares"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/dependencies.html",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/dependencies"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/controllers.html",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/controllers"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend/configuration.html",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/configuration"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/translations.html",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/translations"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/data/mongo-sql-cheatsheet.html",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/data/mongo-sql-cheatsheet"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/data-migration.html",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/data-migration"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/wysiwyg.html",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/wysiwyg"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/frontend/webpack.html",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/webpack"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/data/sql.html",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/data/sql"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/data/sql-relations.html",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/data/sql-relations"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/data/mongo.html",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/data/mongo"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/v4/code/backend.html",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code-migration"
  },
  {
    "from": "/developer-docs/latest/developer-resources/database-apis-reference/rest-api/filtering-locale-publication.html",
    "to": "/dev-docs/api/rest/filters-locale-publication"
  },
  {
    "from": "/developer-docs/latest/developer-resources/database-apis-reference/rest/relations-reordering.html",
    "to": "/dev-docs/api/rest/relations"
  },
  {
    "from": "/developer-docs/latest/developer-resources/database-pabase-apis-reference/rest-reference/rest-api.html",
    "to": "/dev-docs/api/rest"
  },
  {
    "from": "/developer-docs/latest/development/custom-field.html",
    "to": "/dev-docs/custom-fields"
  },
  {
    "from": "/developer-docs/latest/development/custom-fields.html",
    "to": "/dev-docs/custom-fields"
  },
  {
    "from": "/developer-docs/latest/guides/external-data.html",
    "to": "/dev-docs/integrations"
  },
  {
    "from": "/developer-docs/latest/guides/process-manager.html",
    "to": "https://forum.strapi.io/t/how-to-use-pm2-process-manager-with-strapi/"
  },
  {
    "from": "/developer-docs/latest/guides/registering-a-field-in-admin.html",
    "to": "/dev-docs/custom-fields"
  },
  {
    "from": "/developer-docs/latest/guides/unit-testing.html",
    "to": "/dev-docs/testing"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/21yunbox.html",
    "to": "/dev-docs/deployment"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/google-app-engine.html.",
    "to": "/dev-docs/deployment"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/qovery.html",
    "to": "/dev-docs/deployment"
  },
  {
    "from": "/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/render.html",
    "to": "/dev-docs/deployment"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-1-to-3.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-3.0.x-to-3.1.x.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-3.1.x-to-3.2.x.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-3.2.3-to-3.2.4.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-3.2.5-to-3.3.0.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-3.3.x-to-3.4.0.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-3.4.x-to-3.4.4.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.12.1-to-alpha.12.2.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.12.3-to-alpha.12.4.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.12.5-to-alpha.12.6.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.12.6-to-alpha.12.7.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.12.7-to-alpha.13.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.13-to-alpha.13.1.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.14.1-to-alpha.14.2.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.14.2-to-alpha.14.3.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.14.4-to-alpha.14.5.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.14.5-to-alpha.15.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.15-to-alpha.16.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.16-to-alpha.17.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.17-to-alpha.18.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.18-to-alpha.19.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.19-to-alpha.20.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.20-to-alpha.21.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.21-to-alpha.22.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.22-to-alpha.23.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.23-to-alpha.24.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.24-to-alpha.25.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.25-to-alpha.26.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.26-to-beta.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.7.4-to-alpha.8.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.8-to-alpha.9.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.9-to-alpha.10.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-beta.15-to-beta.16.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-beta.16-to-beta.17.4.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-beta.17-to-beta.18.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-beta.18-to-beta.19.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-beta.19-to-beta.19.4.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-beta.19-to-beta.20.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-beta.20-to-3.0.0.html",
    "to": "https://docs-v3.strapi.io/dev-docs/migration-guides"
  },
  {
    "from": "/developer-docs/latest/developer-resources/content-api/integrations/vue-js.html%23create-a-vue-js-app",
    "to": "/dev-docs/integrations/vue-js"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-1-to-3.html",
    "to": "https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-3.0.x-to-3.1.x.html",
    "to": "https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-3.1.x-to-3.2.x.html",
    "to": "https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-3.2.3-to-3.2.4.html",
    "to": "https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-3.2.5-to-3.3.0.html",
    "to": "https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-3.3.x-to-3.4.0.html",
    "to": "https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-3.4.x-to-3.4.4.html",
    "to": "https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.12.1-to-alpha.12.2.html",
    "to": "https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.12.3-to-alpha.12.4.html",
    "to": "https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.12.5-to-alpha.12.6.html",
    "to": "https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.12.6-to-alpha.12.7.html",
    "to": "https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.12.7-to-alpha.13.html",
    "to": "https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.13-to-alpha.13.1.html",
    "to": "https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.14.1-to-alpha.14.2.html",
    "to": "https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.14.2-to-alpha.14.3.html",
    "to": "https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.14.4-to-alpha.14.5.html",
    "to": "https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.14.5-to-alpha.15.html",
    "to": "https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.15-to-alpha.16.html",
    "to": "https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.16-to-alpha.17.html",
    "to": "https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.17-to-alpha.18.html",
    "to": "https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.18-to-alpha.19.html",
    "to": "https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.19-to-alpha.20.html",
    "to": "https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.20-to-alpha.21.html",
    "to": "https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.21-to-alpha.22.html",
    "to": "https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.22-to-alpha.23.html",
    "to": "https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.23-to-alpha.24.html",
    "to": "https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.24-to-alpha.25.html",
    "to": "https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.25-to-alpha.26.html",
    "to": "https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html"
  },
  {
    "from": "/developer-docs/latest/update-migration-guides/migration-guides/migration-guide-alpha.26-to-beta.html",
    "to": "https://docs-v3.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html"
  },

  // Developer Documentation - MIGRATION
  {
    "from": "/dev-docs/migration/v3-to-v4/code/configuration",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/configuration"
  },
  {
    "from": "/dev-docs/migration/v3-to-v4/code/content-type-schema",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/content-type-schema"
  },
  {
    "from": "/dev-docs/migration/v3-to-v4/code/controllers",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/controllers"
  },
  {
    "from": "/dev-docs/migration/v3-to-v4/code/dependencies",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/dependencies"
  },
  {
    "from": "/dev-docs/migration/v3-to-v4/code/global-middlewares",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/global-middlewares"
  },
  {
    "from": "/dev-docs/migration/v3-to-v4/code/graphql",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/graphql"
  },
  {
    "from": "/dev-docs/migration/v3-to-v4/code/policies",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/policies"
  },
  {
    "from": "/dev-docs/migration/v3-to-v4/code/route-middlewares",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/route-middlewares"
  },
  {
    "from": "/dev-docs/migration/v3-to-v4/code/routes",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/routes"
  },
  {
    "from": "/dev-docs/migration/v3-to-v4/code/services",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/services"
  },
  {
    "from": "/dev-docs/migration/v3-to-v4/code-migration",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code-migration"
  },
  {
    "from": "/dev-docs/migration/v3-to-v4/code/backend",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/backend"
  },
  {
    "from": "/dev-docs/migration/v3-to-v4/code/frontend",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/frontend"
  },
  {
    "from": "/dev-docs/migration/v3-to-v4/code/strapi-global",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/strapi-global"
  },
  {
    "from": "/dev-docs/migration/v3-to-v4/code/theming",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/theming"
  },
  {
    "from": "/dev-docs/migration/v3-to-v4/code/translations",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/translations"
  },
  {
    "from": "/dev-docs/migration/v3-to-v4/code/webpack",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/webpack"
  },
  {
    "from": "/dev-docs/migration/v3-to-v4/code/wysiwyg",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/code/wysiwyg"
  },
  {
    "from": "/dev-docs/migration/v3-to-v4/plugin/update-folder-structure",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/plugin/update-folder-structure"
  },
  {
    "from": "/dev-docs/migration/v3-to-v4/plugin-migration",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/plugin-migration"
  },
  {
    "from": "/dev-docs/migration/v3-to-v4/plugin/migrate-back-end",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/plugin/migrate-back-end"
  },
  {
    "from": "/dev-docs/migration/v3-to-v4/plugin/migrate-front-end",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/plugin/migrate-front-end"
  },
  {
    "from": "/dev-docs/migration/v3-to-v4/plugin/enable-plugin",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/plugin/enable-plugin"
  },
  {
    "from": "/dev-docs/migration/v3-to-v4/data-migration",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/data-migration"
  },
  {
    "from": "/dev-docs/migration/v3-to-v4/data/sql",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/data/sql"
  },
  {
    "from": "/dev-docs/migration/v3-to-v4/data/sql-relations",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/data/sql-relations"
  },
  {
    "from": "/dev-docs/migration/v3-to-v4/data/mongo",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/data/mongo"
  },
  {
    "from": "/dev-docs/migration/v3-to-v4/data/mongo-sql-cheatsheet",
    "to": "https://docs-v4.strapi.io/dev-docs/migration/v3-to-v4/data/mongo-sql-cheatsheet"
  },

  // Developer Documentation - INTEGRATIONS 
  {
    "from": "/dev-docs/integrations/11ty",
    "to": "https://strapi.io/integrations/11ty-cms"
  },
  {
    "from": "/dev-docs/integrations/dart",
    "to": "https://strapi.io/integrations/dart-cms"
  },
  {
    "from": "/dev-docs/integrations/flutter",
    "to": "https://strapi.io/integrations/flutter-cms"
  },
  {
    "from": "/dev-docs/integrations/gatsby",
    "to": "https://strapi.io/integrations/gatsby-cms"
  },
  {
    "from": "/dev-docs/integrations/gridsome",
    "to": "https://strapi.io/integrations/gridsome-cms"
  },
  {
    "from": "/dev-docs/integrations/go",
    "to": "https://strapi.io/integrations/go-cms"
  },
  {
    "from": "/dev-docs/integrations/jekyll",
    "to": "https://strapi.io/integrations/jekyll-cms"
  },
  {
    "from": "/dev-docs/integrations/laravel",
    "to": "https://strapi.io/integrations/laravel-cms"
  },
  {
    "from": "/dev-docs/integrations/next-js",
    "to": "https://strapi.io/integrations/nextjs-cms"
  },
  {
    "from": "/dev-docs/integrations/nuxt-js",
    "to": "https://strapi.io/integrations/nuxtjs-cms"
  },
  {
    "from": "/dev-docs/integrations/php",
    "to": "https://strapi.io/integrations/php-cms"
  },
  {
    "from": "/dev-docs/integrations/python",
    "to": "https://strapi.io/integrations/python-cms"
  },
  {
    "from": "/dev-docs/integrations/react",
    "to": "https://strapi.io/integrations/react-cms"
  },
  {
    "from": "/dev-docs/integrations/ruby",
    "to": "https://strapi.io/integrations/ruby-cms"
  },
  {
    "from": "/dev-docs/integrations/sapper",
    "to": "https://strapi.io/integrations/sapper-cms"
  },
  {
    "from": "/dev-docs/integrations/svelte",
    "to": "https://strapi.io/integrations/svelte-cms"
  },
  {
    "from": "/dev-docs/integrations/vue",
    "to": "https://strapi.io/integrations/vuejs-cms"
  },
  {
    "from": "/dev-docs/integrations",
    "to": "https://strapi.io/integrations"
  },

  // Developer Documentation - DEPLOYMENT 
  {
    "from": "/dev-docs/deployment/strapi-cloud",
    "to": "/cloud/intro"
  },
  {
    "from": "/dev-docs/deployment/digitalocean",
    "to": "https://strapi.io/integrations/digital-ocean"
  },
  {
    "from": "/dev-docs/deployment/digitalocean-app-platform",
    "to": "https://strapi.io/integrations/digital-ocean"
  },
  {
    "from": "/dev-docs/deployment/google-app-engine",
    "to": "https://forum.strapi.io/t/strapi-v4-on-google-app-engine/28629"
  },
  {
    "from": "/dev-docs/deployment/heroku",
    "to": "https://strapi.io/integrations/heroku"
  },
  {
    "from": "/dev-docs/deployment/amazon-aws",
    "to": "https://strapi.io/integrations/aws"
  },
  {
    "from": "/dev-docs/deployment/azure",
    "to": "https://strapi.io/integrations/azure"
  },
  {
    "from": "/dev-docs/deployment/process-manager",
    "to": "https://forum.strapi.io/t/how-to-use-pm2-process-manager-with-strapi/"
  },
  {
    "from": "/dev-docs/deployment/nginx-proxy",
    "to": "https://forum.strapi.io/t/nginx-proxing-with-strapi/"
  },
  {
    "from": "/dev-docs/deployment/haproxu-proxy",
    "to": "https://forum.strapi.io/t/haproxy-proxying-with-strapi/"
  },
  {
    "from": "/dev-docs/deployment/caddy-proxy",
    "to": "https://forum.strapi.io/t/caddy-proxying-with-strapi/"
  },

  // Developer Documentation - API
  {
    "from": "/dev-docs/api/document-service/select",
    "to": "/dev-docs/api/document-service/fields"
  },
  {
    "from": "/dev-docs/api/admin-panel-api",
    "to": "/dev-docs/plugins/admin-panel-api"
  },
  {
    "from": "/dev-docs/api/server-api",
    "to": "/dev-docs/plugins/server-api"
  },
  {
    "from": "/dev-docs/api/plugins/server",
    "to": "/dev-docs/plugins/server-api"
  },
  {
    "from": "/dev-docs/api/plugins/admin",
    "to": "/dev-docs/plugins/admin-panel-api"
  },
  {
    "from": "/dev-docs/api/plugins/admin-panel",
    "to": "/dev-docs/plugins/admin-panel-api"
  },

  // Core Redirections
  {
    "from": "/cloud",
    "to": "/cloud/intro"
  },
  {
    "from": "/developer-",
    "to": "/dev-docs"
  },
  {
    "from": "/developer-docs",
    "to": "/dev-docs"
  },
  {
    "from": "/dev-docs/",
    "to": "/dev-docs/intro"
  },
  {
    "from": "/user-docs/getting-started/introduction.html",
    "to": "/user-docs"
  },
  {
    "from": "/user-docs/getting-started/introduction",
    "to": "/user-docs/intro"
  },
  {
    "from": "/user-docs/",
    "to": "/user-docs/intro"
  },
  {
    "from": "/developer-docs/getting-started/troublshooting.html",
    "to": "/dev-docs/faq"
  },
  {
    "from": "/developer-docs/getting-started/troubleshooting.html",
    "to": "/dev-docs/faq"
  },
  {
    "from": "/dev-docs/whatsnew",
    "to": "/dev-docs/whats-new"
  },

  // Developer Documentation - CONFIGURATIONS
  {
    "from": "/dev-docs/configurations/rbac",
    "to": "/dev-docs/configurations/guides/rbac"
  },
  {
    "from": "/dev-docs/configurations/public-assets",
    "to": "/dev-docs/configurations/guides/public-assets"
  },

  // Developer Documentation - PLUGINS
  {
    "from": "/dev-docs/plugins/i18n",
    "to": "/user-docs/features/internationalization"
  },
  {
    "from": "/dev-docs/plugins/i18n",
    "to": "/dev-docs/i18n"
  },

  // User Documentation - SETTINGS
  {
    "from": "/user-docs/settings/managing-global-settings",
    "to": "/user-docs/settings/admin-panel"
  },

  // User Documentation - USERS ROLES PERMISSIONS
  {
    "from": "/user-docs/users-roles-permissions/introduction-to-users-roles-permissions",
    "to": "/user-docs/users-roles-permissions"
  },

  // User Documentation - CONTENT MANAGER
  {
    "from": "/user-docs/content-manager/introduction-to-content-manager",
    "to": "/user-docs/content-manager"
  },

  // Developer Documentation - PLUGINS DEVELOPMENT
  {
    "from": "/dev-docs/plugins-development",
    "to": "/dev-docs/plugins/developing-plugins"
  },

  // Developer Documentation - UPDATE VERSION
  {
    "from": "/dev-docs/update-version",
    "to": "/dev-docs/upgrades"
  },

  // Developer Documentation - RBAC 
  {
    "from": "/dev-docs/rbac",
    "to": "/dev-docs/configurations/guides/rbac"
  },

  // Developer Documentation - CUSTOM FIELD
  {
    "from": "/dev-docs/custom-field",
    "to": "/dev-docs/custom-fields"
  }
];
