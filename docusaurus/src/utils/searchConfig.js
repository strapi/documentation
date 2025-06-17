// Helper functions for content type detection
export function getContentTypeFromPath(pathname) {
  if (pathname.includes('/api/')) return 'api';
  if (pathname.includes('/cloud/')) return 'cloud';
  if (pathname.includes('/guides/')) return 'guides';
  if (pathname.includes('/cms/features/')) return 'features';
  if (pathname.includes('/cms/configurations/')) return 'configuration';
  if (pathname.includes('/cms/')) return 'cms';
  return 'documentation';
}

export function getSectionFromPath(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  return segments[1] || 'general';
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

// Content type configurations for free version (without advanced features)
const CONTENT_TYPE_CONFIGS = {
  api: {
    searchParameters: {
      ...BASIC_SEARCH_PARAMS,
      // We'll use client-side filtering instead of facetFilters
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

// Helper function to filter results client-side (since we can't use facetFilters on free plan)
export function filterResultsByContentType(items, contentType) {
  if (contentType === 'all' || !contentType) {
    return items;
  }
  
  return items.filter(item => {
    const itemContentType = item.contentType || getContentTypeFromPath(item.url);
    return itemContentType === contentType;
  });
}