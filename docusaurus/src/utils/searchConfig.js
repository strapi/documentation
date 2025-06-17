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

// Advanced search parameters for different content types
const CONTENT_TYPE_CONFIGS = {
  api: {
    attributesToRetrieve: [
      'hierarchy',
      'content',
      'url',
      'type',
      'method', // for API endpoints
      'parameters' // for API parameters
    ],
    searchParameters: {
      facetFilters: ['type:api'],
      customRanking: ['desc(weight.method)', 'asc(weight.position)']
    }
  },
  guides: {
    attributesToRetrieve: [
      'hierarchy',
      'content', 
      'url',
      'type',
      'difficulty', // beginner, intermediate, advanced
      'category'
    ],
    searchParameters: {
      facetFilters: ['type:guide'],
      customRanking: ['desc(weight.difficulty)', 'desc(weight.popularity)']
    }
  },
  features: {
    attributesToRetrieve: [
      'hierarchy',
      'content',
      'url', 
      'type',
      'version', // feature version
      'status' // stable, beta, experimental
    ],
    searchParameters: {
      facetFilters: ['type:feature'],
      customRanking: ['desc(weight.status)', 'desc(weight.version)']
    }
  }
};

// Enhanced DocSearch configuration factory
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
    },
    attributesToRetrieve: typeConfig.attributesToRetrieve
  };
}