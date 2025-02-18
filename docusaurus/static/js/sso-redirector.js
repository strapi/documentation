document.addEventListener('DOMContentLoaded', () => {
  // Define SSO provider redirections mapping
  const ssoProviders = {
    'discord': '/cms/configurations/sso-providers/discord',
    'github': '/cms/configurations/sso-providers/github',
    'google': '/cms/configurations/sso-providers/google',
    'microsoft': '/cms/configurations/sso-providers/microsoft',
    'okta': '/cms/configurations/sso-providers/okta',
    'keycloak': '/cms/configurations/sso-providers/keycloak-openid-connect'
  };

  const path = window.location.pathname;
  const hash = window.location.hash.substring(1); // Remove the # from the beginning

  // Case 1: Direct redirection from source URL with anchor
  // Example: /dev-docs/configurations/sso#discord -> /cms/configurations/sso-providers/discord
  if (path === '/dev-docs/configurations/sso' && hash && ssoProviders[hash]) {
    window.location.href = ssoProviders[hash];
    return;
  }

  // Case 2: Default redirection without anchor
  // Example: /dev-docs/configurations/sso -> /cms/configurations/guides/configure-sso
  if (path === '/dev-docs/configurations/sso' && !hash) {
    window.location.href = '/cms/configurations/guides/configure-sso';
    return;
  }

  // Case 3: Fix incorrect redirection that already happened
  // Example: /cms/configurations/guides/configure-sso#discord -> /cms/configurations/sso-providers/discord
  if (path === '/cms/configurations/guides/configure-sso' && hash && ssoProviders[hash]) {
    window.location.href = ssoProviders[hash];
    return;
  }

  // Intercept clicks on links to handle anchors before navigation
  document.body.addEventListener('click', (event) => {
    // Check if the click was on a link
    const link = event.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Check if the link points to the SSO page with a fragment
    if (href.startsWith('/dev-docs/configurations/sso#')) {
      event.preventDefault();
      
      // Extract the fragment
      const fragment = href.split('#')[1];
      
      // Redirect directly to the correct provider page if known
      if (ssoProviders[fragment]) {
        window.location.href = ssoProviders[fragment];
      } else {
        // Otherwise, use the default redirection
        window.location.href = '/cms/configurations/guides/configure-sso';
      }
    }
  });
});