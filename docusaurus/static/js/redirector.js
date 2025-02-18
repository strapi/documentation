document.addEventListener('DOMContentLoaded', () => {
  // SSO provider redirections
  const ssoRedirects = {
    '/dev-docs/configurations/sso': {
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
      'rest': '/cms/api/rest/locale',
      'rest-get-all': '/cms/api/rest/locale#rest-get-all',
      'rest-get': '/cms/api/rest/locale#rest-get',
      'rest-create': '/cms/api/rest/locale#rest-create',
      'get-one-collection-type': '/cms/api/rest/locale#get-one-collection-type',
      'get-one-single-type': '/cms/api/rest/locale#get-one-single-type',
      'rest-create-default-locale': '/cms/api/rest/locale#rest-create-default-locale',
      'rest-create-specific-locale': '/cms/api/rest/locale#rest-create-specific-locale',
      'rest-update': '/cms/api/rest/locale#rest-update',
      'rest-put-collection-type': '/cms/api/rest/locale#rest-put-collection-type',
      'rest-put-single-type': '/cms/api/rest/locale#rest-put-single-type',
      'rest-delete': '/cms/api/rest/locale#rest-delete',
      'rest-delete-collection-type': '/cms/api/rest/locale#rest-delete-collection-type',
      'rest-delete-single-type': '/cms/api/rest/locale#rest-delete-single-type',
      'graphql': '/cms/api/graphql#locale',
      'graphql-fetch-all': '/cms/api/graphql#locale-fetch-all',
      'graphql-fetch': '/cms/api/graphql#locale-fetch',
      'graphql-create': '/cms/api/graphql#locale-create',
      'graphql-update': '/cms/api/graphql#locale-update',
      'graphql-delete': '/cms/api/graphql#locale-delete'
    },
    '/user-docs/settings/configuring-users-permissions-plugin-settings': {
      '_default': '/cms/features/users-permissions',
      'configuring-advanced-settings': '/cms/features/users-permissions#advanced-settings'
    }
  };

  // Combine all redirects
  const allRedirects = {...ssoRedirects, ...i18nRedirects};

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