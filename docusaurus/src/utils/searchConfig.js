// Enhanced content detection based on URL structure and content
export function getContentTypeFromPath(pathname) {
  if (pathname.includes('/cloud/')) return 'cloud';
  if (pathname.includes('/cms/')) return 'cms';
  
  return 'documentation';
}

// Enhanced detection that provides specific sub-categories
export function getEnhancedContentType(item) {
  const pathname = new URL(item.url).pathname;
  
  // Primary detection for Cloud content
  if (pathname.includes('/cloud/')) return 'cloud';
  
  // For CMS content, provide sub-categorization
  if (pathname.includes('/cms/')) {
    // Features category - CMS capabilities and built-in functionality
    if (pathname.includes('/cms/features/') ||
        pathname.includes('/content-manager') ||
        pathname.includes('/content-type-builder') ||
        pathname.includes('/media-library') ||
        pathname.includes('/users-permissions') ||
        pathname.includes('/internationalization') ||
        pathname.includes('/audit-logs') ||
        pathname.includes('/releases') ||
        pathname.includes('/review-workflows')) {
      return 'features';
    }
    
    // Development category - customization and plugin development
    if (pathname.includes('/cms/backend-customization/') ||
        pathname.includes('/cms/admin-panel-customization/') ||
        pathname.includes('/cms/plugins-development/') ||
        pathname.includes('/controllers') ||
        pathname.includes('/services') ||
        pathname.includes('/routes') ||
        pathname.includes('/middlewares') ||
        pathname.includes('/policies') ||
        pathname.includes('/hooks') ||
        pathname.includes('/lifecycle') ||
        pathname.includes('/custom-fields')) {
      return 'development';
    }
    
    // API category - REST and GraphQL APIs
    if (pathname.includes('/cms/api/') ||
        pathname.includes('/api/') ||
        pathname.includes('document-service') ||
        pathname.includes('entity-service') ||
        pathname.includes('/rest/') ||
        pathname.includes('/graphql/') ||
        pathname.includes('/query-engine/') ||
        pathname.includes('/webhooks')) {
      return 'api';
    }
    
    // Configuration category - setup and configuration
    if (pathname.includes('/cms/configurations/') ||
        pathname.includes('/database') ||
        pathname.includes('/server') ||
        pathname.includes('/admin-panel') ||
        pathname.includes('environment') ||
        pathname.includes('/typescript') ||
        pathname.includes('/deployment') ||
        pathname.includes('/security')) {
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

// Enhanced filter function with better logic
export function filterResultsByContentType(items, contentType) {
  if (!contentType || contentType === '' || contentType === 'all') {
    return items;
  }
  
  return items.filter(item => {
    const itemContentType = item.contentType || getEnhancedContentType(item);
    
    // Exact match
    if (itemContentType === contentType) {
      return true;
    }
    
    // Special handling: if filtering by 'cms', include all cms sub-categories
    if (contentType === 'cms' && 
        ['cms', 'features', 'development', 'api', 'configuration'].includes(itemContentType)) {
      return true;
    }
    
    return false;
  });
}

// Get filter statistics for UI display
export function getFilterStats(items) {
  const stats = {
    all: items.length,
    cms: 0,
    cloud: 0,
    features: 0,
    development: 0,
    api: 0,
    configuration: 0,
    documentation: 0
  };
  
  items.forEach(item => {
    const contentType = item.contentType || getEnhancedContentType(item);
    if (stats.hasOwnProperty(contentType)) {
      stats[contentType]++;
    }
    
    // Count CMS subcategories towards CMS total
    if (['features', 'development', 'api', 'configuration'].includes(contentType)) {
      stats.cms++;
    }
  });
  
  return stats;
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

// Content type configurations
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
  },
  development: {
    searchParameters: {
      ...BASIC_SEARCH_PARAMS,
    }
  },
  configuration: {
    searchParameters: {
      ...BASIC_SEARCH_PARAMS,
    }
  }
};

// Enhanced DocSearch configuration factory
export function createSearchConfig(baseConfig, contentType = 'all') {
  if (contentType === 'all' || contentType === '') {
    return {
      ...baseConfig,
      searchParameters: {
        ...baseConfig.searchParameters,
        ...BASIC_SEARCH_PARAMS,
        hitsPerPage: 100 // Get more results for filtering
      }
    };
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

// Utility function to debounce filter changes
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}