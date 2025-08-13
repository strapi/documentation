/**
 * Custom redirector script
 * to handle complex redirection cases
 * that the vercel.json file can't manage.
 * 
 * For instance, the Vercel server is not aware
 * of the anchors part in the URL (what's after the #)
 * so we're redirecting these edge use cases client-side.
 * 
 * Please ensure that the main URLs have at least
 * one fallback URL in the vercel.json file, in case
 * the user has disabled JavaScript or the script
 * does not work.
 */
document.addEventListener('DOMContentLoaded', () => {
  // SSO provider redirections
  const ssoRedirects = {
    '/dev-docs/configurations/sso': { // base URL
      /**
       * Anything that is not '_default' is for an anchor
       * e.g., 'discord' = base URL + '#' + 'discord'
       * = redirection for /dev-docs/configurations/sso#discord
       */
      '_default': '/cms/configurations/guides/configure-sso',
      'discord': '/cms/configurations/sso-providers/discord',
      'github': '/cms/configurations/sso-providers/github',
      'google': '/cms/configurations/sso-providers/google',
      'microsoft': '/cms/configurations/sso-providers/microsoft',
      'okta': '/cms/configurations/sso-providers/okta',
      'keycloak-openid-connect': '/cms/configurations/sso-providers/keycloak'
    }
  };

  // i18n redirections
  const i18nRedirects = {
    '/dev-docs/plugins/i18n': {
      '_default': '/cms/features/internationalization',
      'usage-with-the-rest-api': '/cms/api/rest/locale'
    },
    '/dev-docs/i18n': {
      '_default': '/cms/features/internationalization',
      // REST-related anchors - all point to sections within the same page
      'rest': '/cms/api/rest/locale',
      'rest-get-all': '/cms/api/rest/locale#rest-get-all',
      'rest-get': '/cms/api/rest/locale#rest-get',
      'rest-create': '/cms/api/rest/locale#rest-create',
      'rest-create-default-locale': '/cms/api/rest/locale#rest-create-default-locale',
      'rest-create-specific-locale': '/cms/api/rest/locale#rest-create-specific-locale',
      'rest-update': '/cms/api/rest/locale#rest-update',
      'rest-put-collection-type': '/cms/api/rest/locale#rest-put-collection-type',
      'rest-put-single-type': '/cms/api/rest/locale#rest-put-single-type',
      'rest-delete': '/cms/api/rest/locale#rest-delete',
      'rest-delete-collection-type': '/cms/api/rest/locale#rest-delete-collection-type',
      'rest-delete-single-type': '/cms/api/rest/locale#rest-delete-single-type',
      // Collection-type and single-type specific anchors
      'get-one-collection-type': '/cms/api/rest/locale#get-one-collection-type',
      'get-one-single-type': '/cms/api/rest/locale#get-one-single-type',
      // GraphQL-related anchors
      'graphql': '/cms/api/graphql#locale',
      'graphql-fetch-all': '/cms/api/graphql#locale-fetch-all',
      'graphql-fetch': '/cms/api/graphql#locale-fetch',
      'graphql-create': '/cms/api/graphql#locale-create',
      'graphql-update': '/cms/api/graphql#locale-update',
      'graphql-delete': '/cms/api/graphql#locale-delete'
    }
  };

  // User docs redirections
  const settingsRedirects = {
    '/user-docs/settings/configuring-users-permissions-plugin-settings': {
      '_default': '/cms/features/users-permissions',
      'configuring-advanced-settings': '/cms/features/users-permissions#advanced-settings',
      'configuring-providers': '/cms/features/users-permissions#providers',
      'configuring-email-templates': '/cms/features/users-permissions#email-templates'
    },
  };

  const uAndpRedirects = {
  '/user-docs/users-roles-permissions/configuring-end-users-roles': {
      '_default': '/cms/features/users-permissions', 
      'editing-roles-details': '/cms/features/users-permissions#editing-a-role',
      'configuring-roles-permissions': '/cms/features/users-permissions#editing-a-role',
      'deleting-a-role': '/cms/features/users-permissions#deleting-a-role',
      'reset-password': '/cms/features/users-permissions#email-templates',
      'reset-password-1': '/cms/features/users-permissions#email-templates',
      'email-validation': '/cms/features/users-permissions#email-templates',
      'usage-1': '/cms/features/users-permissions',
      'understanding-the-login-flow': '/cms/configurations/users-and-permissions-providers#understanding-the-login-flow',
      'setting-up-the-server-url': '/cms/configurations/users-and-permissions-providers#setting-up-the-server-url',
      'forgotten-password-ask-for-the-reset-password-link': '/cms/features/users-permissions#email-templates',
      'reset-password-send-the-new-password': '/cms/features/users-permissions#email-templates',
      'setup-the-frontend': '/cms/configurations/users-and-permissions-providers/new-provider-guide#frontend-setup',
      'creating-a-custom-provider': '/cms/configurations/users-and-permissions-providers/new-provider-guide',
      'auth0': '/cms/configurations/users-and-permissions-providers/auth-zero',
      'auth0-config': '/cms/configurations/users-and-permissions-providers/auth-zero',
      'auth0-strapi-config': '/cms/configurations/users-and-permissions-providers/auth-zero#strapi-configuration',
      'aws-cognito': '/cms/configurations/users-and-permissions-providers/aws-cognito',
      'aws-cognito-config': '/cms/configurations/users-and-permissions-providers/aws-cognito#aws-cognito-configuration',
      'aws-cognito-strapi-config': '/cms/configurations/users-and-permissions-providers/aws-cognito#strapi-configuration',
      'cas': '/cms/configurations/users-and-permissions-providers/cas',
      'cas-config': '/cms/configurations/users-and-permissions-providers/cas',
      'cas-strapi-config': '/cms/configurations/users-and-permissions-providers/cas#strapi-configuration',
      'discord': '/cms/configurations/users-and-permissions-providers/discord',
      'discord-configuration': '/cms/configurations/users-and-permissions-providers/discord',
      'discord-strapi-configuration': '/cms/configurations/users-and-permissions-providers/discord#strapi-configuration',
      'facebook': '/cms/configurations/users-and-permissions-providers/facebook',
      'facebook-config': '/cms/configurations/users-and-permissions-providers/facebook',
      'facebook-strapi-config': '/cms/configurations/users-and-permissions-providers/facebook#strapi-configuration',
      'github': '/cms/configurations/users-and-permissions-providers/github',
      'github-config': '/cms/configurations/users-and-permissions-providers/github',
      'github-strapi-config': '/cms/configurations/users-and-permissions-providers/github#strapi-configuration',
      'google': '/cms/configurations/users-and-permissions-providers/google',
      'google-config': '/cms/configurations/users-and-permissions-providers/google',
      'google-strapi-config': '/cms/configurations/users-and-permissions-providers/google#strapi-configuration',
      'instagram': '/cms/configurations/users-and-permissions-providers/instagram',
      'instagram-config': '/cms/configurations/users-and-permissions-providers/instagram',
      'instagram-strapi-config': '/cms/configurations/users-and-permissions-providers/instagram#strapi-configuration',
      'keycloak': '/cms/configurations/users-and-permissions-providers/keycloak',
      'keycloak-config': '/cms/configurations/users-and-permissions-providers/keycloak#keycloak-configuration',
      'keycloak-strapi-config': '/cms/configurations/users-and-permissions-providers/keycloak#strapi-configuration',
      'linkedin': '/cms/configurations/users-and-permissions-providers/linkedin',
      'linkedin-config': '/cms/configurations/users-and-permissions-providers/linkedin',
      'linkedin-strapi-config': '/cms/configurations/users-and-permissions-providers/linkedin#strapi-configuration',
      'patreon': '/cms/configurations/users-and-permissions-providers/patreon',
      'patreon-config': '/cms/configurations/users-and-permissions-providers/patreon',
      'patreon-strapi-config': '/cms/configurations/users-and-permissions-providers/patreon#strapi-configuration',
      'reddit': '/cms/configurations/users-and-permissions-providers/reddit',
      'reddit-config': '/cms/configurations/users-and-permissions-providers/reddit',
      'reddit-strapi-config': '/cms/configurations/users-and-permissions-providers/reddit#strapi-configuration',
      'twitch': '/cms/configurations/users-and-permissions-providers/twitch',
      'twitch-config': '/cms/configurations/users-and-permissions-providers/twitch',
      'twitch-strapi-config': '/cms/configurations/users-and-permissions-providers/twitch#strapi-configuration',
      'twitter': '/cms/configurations/users-and-permissions-providers/twitter',
      'twitter-config': '/cms/configurations/users-and-permissions-providers/twitter',
      'twitter-strapi-config': '/cms/configurations/users-and-permissions-providers/twitter#strapi-configuration',
      'vk': '/cms/configurations/users-and-permissions-providers/vk',
      'vk-config': '/cms/configurations/users-and-permissions-providers/vk',
      'vk-strapi-config': '/cms/configurations/users-and-permissions-providers/vk#strapi-configuration',
    },
  }

  const auditLogsRedirects = {
    '/user-docs/settings/audit-logs': {
      '_default': '/cms/features/audit-logs',
      'events-logged': '/cms/features/audit-logs#usage'
    },
  }
    
  const pluginRedirects = {
    '/user-docs/plugins/strapi-plugins': {
      '_default': '/cms/plugins/installing-plugins-via-marketplace',
      'i18n': '/cms/features/internationalization',
      'graphql': '/cms/plugins/graphql',
      'sentry': '/cms/plugins/sentry',
      'documentation': '/cms/plugins/documentation',
      'email': '/cms/features/email',
      'seo': '/cms/plugins/installing-plugins-via-marketplace',
      'gatsby': '/cms/plugins/installing-plugins-via-marketplace',
      'custom-fields': '/cms/features/custom-fields'
    },
    '/dev-docs/plugins/email': {
      '_default': '/cms/features/email',
      'sending-emails-from-a-lifecycle-hook': '/cms/features/email#lifecycle-hook',
      'sending-emails-with-a-controller-or-service': '/cms/features/email#controller-service',
    },
    '/dev-docs/plugins/documentation': {
      '_default': '/cms/plugins/documentation',
      'restrict-the-access-to-your-api-documentation': '/cms/plugins/documentation#restrict-access',
      'indicate-which-plugins-need-documentation-generated': '/cms/plugins/documentation#define-which-plugins',
      'authenticated-requests': '/cms/plugins/documentation#authenticating-requests'
    }
  }

  const adminPanelRedirects = {
    '/user-docs/getting-started/setting-up-admin-panel': {
      '_default': '/cms/features/admin-panel',
      'using-sso-for-authentication': '/cms/features/admin-panel#usage',
      'accessing-the-admin-panel': '/cms/features/admin-panel',
      'changing-your-password': '/cms/features/admin-panel#changing-account-password',
      'setting-up-your-administrator-profile': '/cms/features/admin-panel#configuration'
    }
  };

  const contentManagerRedirects = {
    '/user-docs/content-manager': {
      '_default': '/cms/features/content-manager',
      'filtering-entries': '/cms/features/content-manager#overview',
      'single-types': '/cms/features/content-manager#overview',
      'collection-types': '/cms/features/content-manager#overview',
      'creating-a-new-entry': '/cms/features/content-manager#creating--writing-content',
      'configuring-the-table-fields': '/cms/features/content-manager#configuring-the-list-view',
    },
    '/user-docs/content-manager/configuring-view-of-content-type': {
      '_default': '/cms/features/content-manager#configuration',
      'edit-view-settings': '/cms/features/content-manager#configuring-the-edit-view',
      'edit-view-display': '/cms/features/content-manager#configuring-the-edit-view',
      'list-view-display': '/cms/features/content-manager#configuring-the-list-view',
      'list-view-settings': '/cms/features/content-manager#configuring-the-list-view',
      'configuring-the-list-view': '/cms/features/content-manager#configuring-the-list-view',
    }
  }

  // const typeScriptRedirects = {
  //   '/cms/typescript': {
  //     '_default': '/cms/typescript',
  //     'guides': '/cms/typescript/guides'
  //   }
  // }

  const providersRedirects = {
    '/cms/providers': {
      '_default': '/cms/features/media-library#providers',
      'configuring-providers': '/cms/configurations/media-library-providers#configuring-providers',
    }
  };

  // Combine all redirects
  const allRedirects = {
    ...ssoRedirects,
    ...i18nRedirects,
    ...settingsRedirects,
    ...uAndpRedirects,
    ...auditLogsRedirects,
    ...pluginRedirects,
    ...adminPanelRedirects,
    ...contentManagerRedirects,
    ...providersRedirects
    // ...typeScriptRedirects
  };

  // Get current path and hash
  const path = window.location.pathname;
  const hash = window.location.hash.substring(1); // Remove the # from the beginning

  // Handle redirection logic
  if (allRedirects[path]) {
    if (hash && allRedirects[path][hash]) {
      // Redirect to specific target with fragment
      window.location.href = allRedirects[path][hash];
      return;
    } else if (!hash) {
      // Redirect to default target
      window.location.href = allRedirects[path]['_default'];
      return;
    }
  }

  // Handle incorrect redirections - check if we're on a "default" page with a fragment
  // that should actually go to a different page
  Object.keys(allRedirects).forEach(sourcePath => {
    const redirectMap = allRedirects[sourcePath];
    const defaultTarget = redirectMap['_default'];
    
    if (path === defaultTarget && hash) {
      // Check if this hash should go somewhere else
      Object.keys(redirectMap).forEach(sourceHash => {
        if (sourceHash !== '_default' && hash === sourceHash) {
          window.location.href = redirectMap[sourceHash];
          return;
        }
      });
    }
  });

  // Intercept clicks on links to handle anchors before navigation
  document.body.addEventListener('click', (event) => {
    // Check if the click was on a link
    const link = event.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (!href) return;

    // Extract path and hash from the link
    let linkPath, linkHash;
    if (href.includes('#')) {
      const parts = href.split('#');
      linkPath = parts[0] || window.location.pathname;
      linkHash = parts[1];
    } else {
      linkPath = href;
      linkHash = '';
    }

    // Check if this link should be redirected
    if (allRedirects[linkPath]) {
      event.preventDefault();
      
      if (linkHash && allRedirects[linkPath][linkHash]) {
        // Redirect to specific target
        window.location.href = allRedirects[linkPath][linkHash];
      } else {
        // Redirect to default target
        window.location.href = allRedirects[linkPath]['_default'];
      }
    }
  });
});