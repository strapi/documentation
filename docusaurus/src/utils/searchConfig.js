// Optimized content detection based on Strapi docs structure
export function getContentTypeFromPath(pathname) {
  // Cloud content
  if (pathname.includes('/cloud/')) return 'cloud';
  
  // API-related content
  if (pathname.includes('/api/') || 
      pathname.includes('/cms/api/') ||
      pathname.includes('document-service') ||
      pathname.includes('entity-service') ||
      pathname.includes('/rest/') ||
      pathname.includes('/graphql/')) {
    return 'api';
  }
  
  // Development/Customization content
  if (pathname.includes('/cms/backend-customization/') ||
      pathname.includes('/cms/plugins-development/') ||
      pathname.includes('/controllers') ||
      pathname.includes('/services') ||
      pathname.includes('/routes') ||
      pathname.includes('/middlewares') ||
      pathname.includes('/policies')) {
    return 'development';
  }
  
  // Configuration content
  if (pathname.includes('/cms/configurations/') ||
      pathname.includes('/database') ||
      pathname.includes('/server') ||
      pathname.includes('/admin-panel') ||
      pathname.includes('environment')) {
    return 'configuration';
  }
  
  // Features content (most specific features)
  if (pathname.includes('/cms/features/') ||
      pathname.includes('/content-manager') ||
      pathname.includes('/content-type-builder') ||
      pathname.includes('/media-library') ||
      pathname.includes('/users-permissions') ||
      pathname.includes('/internationalization') ||
      pathname.includes('/audit-logs')) {
    return 'features';
  }
  
  // Getting started content
  if (pathname.includes('/getting-started/') ||
      pathname.includes('/quick-start') ||
      pathname.includes('/installation') ||
      pathname.includes('/intro')) {
    return 'getting-started';
  }
  
  // Default for CMS content
  if (pathname.includes('/cms/')) return 'cms-general';
  
  return 'documentation';
}

// Enhanced detection using content analysis for edge cases
export function getEnhancedContentType(item) {
  const pathname = new URL(item.url).pathname;
  
  // Start with path-based detection
  let detectedType = getContentTypeFromPath(pathname);
  
  // If it's generic 'cms-general', try to be more specific
  if (detectedType === 'cms-general') {
    const hierarchy = item.hierarchy || {};
    const title = item.title || '';
    const content = item.content || '';
    
    // Combine relevant text
    const allText = [
      title,
      content,
      hierarchy.lvl0,
      hierarchy.lvl1,
      hierarchy.lvl2
    ].filter(Boolean).join(' ').toLowerCase();
    
    // Feature keywords (things users actually use)
    const featureKeywords = [
      'preview', 'draft', 'publish', 'media', 'upload', 'file',
      'user', 'permission', 'role', 'auth', 'login', 'rbac',
      'content manager', 'content-type builder', 'field',
      'relation', 'component', 'dynamic zone',
      'internationalization', 'i18n', 'locale', 'translation',
      'audit', 'log', 'history', 'version',
      'email', 'provider', 'webhook', 'notification',
      'review', 'workflow', 'stage', 'approval'
    ];
    
    // Development keywords
    const devKeywords = [
      'controller', 'service', 'route', 'middleware', 'policy',
      'lifecycle', 'hook', 'plugin', 'extension', 'custom',
      'backend', 'server-side', 'api endpoint', 'business logic',
      'model', 'schema', 'validation', 'sanitization'
    ];
    
    // Configuration keywords
    const configKeywords = [
      'config', 'configuration', 'setting', 'environment',
      'database', 'server', 'port', 'host', 'ssl',
      'middleware', 'cors', 'helmet', 'rate limit',
      'admin panel', 'dashboard', 'url', 'path'
    ];
    
    // API keywords
    const apiKeywords = [
      'rest', 'graphql', 'endpoint', 'request', 'response',
      'filter', 'sort', 'populate', 'pagination',
      'query', 'parameter', 'header', 'body',
      'document service', 'entity service', 'strapi'
    ];
    
    // Check feature keywords first (most common)
    if (featureKeywords.some(keyword => allText.includes(keyword))) {
      return 'features';
    }
    
    // Then development
    if (devKeywords.some(keyword => allText.includes(keyword))) {
      return 'development';
    }
    
    // Then API
    if (apiKeywords.some(keyword => allText.includes(keyword))) {
      return 'api';
    }
    
    // Finally configuration
    if (configKeywords.some(keyword => allText.includes(keyword))) {
      return 'configuration';
    }
  }
  
  return detectedType;
}

export function getSectionFromPath(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  return segments[1] || 'general';
}

// Helper function to filter results client-side
export function filterResultsByContentType(items, contentType) {
  if (!contentType || contentType === '' || contentType === 'all') {
    return items;
  }
  
  return items.filter(item => {
    const itemContentType = item.contentType || getEnhancedContentType(item);
    
    // Special handling for broader categories
    if (contentType === 'cms' && ['cms-general', 'features', 'configuration'].includes(itemContentType)) {
      return true;
    }
    
    return itemContentType === contentType;
  });
}