// Simple content detection based on URL structure
export function getContentTypeFromPath(pathname) {
  // Primary categories - simple URL-based detection
  if (pathname.includes('/cloud/')) return 'cloud';
  if (pathname.includes('/cms/')) return 'cms';
  
  // If not cms or cloud, it's general documentation
  return 'documentation';
}

// Enhanced detection that can provide sub-categories
export function getEnhancedContentType(item) {
  const pathname = new URL(item.url).pathname;
  
  // Primary detection first
  if (pathname.includes('/cloud/')) return 'cloud';
  
  // For CMS content, we can be more specific if needed
  if (pathname.includes('/cms/')) {
    // Check for sub-categories within CMS
    if (pathname.includes('/cms/features/') ||
        pathname.includes('/content-manager') ||
        pathname.includes('/content-type-builder') ||
        pathname.includes('/media-library') ||
        pathname.includes('/users-permissions') ||
        pathname.includes('/internationalization') ||
        pathname.includes('/audit-logs')) {
      return 'features';
    }
    
    if (pathname.includes('/cms/backend-customization/') ||
        pathname.includes('/cms/admin-panel-customization/') ||
        pathname.includes('/cms/plugins-development/') ||
        pathname.includes('/controllers') ||
        pathname.includes('/services') ||
        pathname.includes('/routes') ||
        pathname.includes('/middlewares') ||
        pathname.includes('/policies')) {
      return 'development';
    }
    
    if (pathname.includes('/cms/api/') ||
        pathname.includes('/api/') ||
        pathname.includes('document-service') ||
        pathname.includes('entity-service') ||
        pathname.includes('/rest/') ||
        pathname.includes('/graphql/')) {
      return 'api';
    }
    
    if (pathname.includes('/cms/configurations/') ||
        pathname.includes('/database') ||
        pathname.includes('/server') ||
        pathname.includes('/admin-panel') ||
        pathname.includes('environment')) {
      return 'configuration';
    }
    
    // Default for CMS content
    return 'cms';
  }
  
  return 'documentation';
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
    
    // Special handling: if filtering by 'cms', include all cms sub-categories
    if (contentType === 'cms' && 
        ['cms', 'features', 'development', 'api', 'configuration'].includes(itemContentType)) {
      return true;
    }
    
    return itemContentType === contentType;
  });
}

// Simplified search parameters compatible with DocSearch free version
const BASIC_SEARCH_PARAMS = {
  hitsPerPage: 20,
  attributesToSnippet: ['content:20'],
  snippetEllipsisText: '…',
  attributesToHighlight: [
    'hierarchy.lvl0',
    'hierarchy.lvl1', 
    'hierarchy.lvl2',
    'hierarchy.lvl3',
    'content'
  ],
  distinct: true,
  typoTolerance: 'min',
  minWordSizefor1Typo: 4,
  minWordSizefor2Typos: 8,
};

// Content type configurations for free version
const CONTENT_TYPE_CONFIGS = {
  api: {
    searchParameters: {
      ...BASIC_SEARCH_PARAMS,
    }
  },
  guides: {
    searchParameters: {
      ...BASIC_SEARCH_PARAMS,
    }
  },
  features: {
    searchParameters: {
      ...BASIC_SEARCH_PARAMS,
    }
  },
  cms: {
    searchParameters: {
      ...BASIC_SEARCH_PARAMS,
    }
  },
  cloud: {
    searchParameters: {
      ...BASIC_SEARCH_PARAMS,
    }
  }
};

// Enhanced DocSearch configuration factory for free version
export function createSearchConfig(baseConfig, contentType = 'all') {
  if (contentType === 'all') {
    return baseConfig;
  }
  
  const typeConfig = CONTENT_TYPE_CONFIGS[contentType];
  if (!typeConfig) {
    return baseConfig;
  }
  
  return {
    ...baseConfig,
    searchParameters: {
      ...baseConfig.searchParameters,
      ...typeConfig.searchParameters
    }
  };
}