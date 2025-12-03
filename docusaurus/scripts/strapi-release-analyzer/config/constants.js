// Centralized tunable constants and regex/pattern lists

export const DOCUMENTATION_SECTIONS = {
  cms: {
    label: '🏗️ CMS Documentation',
    sections: {
      'Getting Started': ['quick-start', 'installation', 'admin-panel', 'deployment'],
      'Features': ['api-tokens', 'audit-logs', 'content-history', 'custom-fields', 'data-management',
                   'draft-and-publish', 'email', 'internationalization', 'i18n', 'media-library',
                   'preview', 'rbac', 'releases', 'review-workflows', 'sso', 'users-permissions',
                   'content-manager', 'content-type-builder'],
      'APIs': ['rest', 'graphql', 'document', 'content-api', 'query-engine'],
      'Configurations': ['database', 'server', 'admin-panel-config', 'middlewares', 'api-config',
                         'environment', 'typescript', 'features-config'],
      'Development': ['backend', 'customization', 'lifecycle', 'services', 'controllers', 'routes',
                      'policies', 'middlewares-dev', 'webhooks'],
      'TypeScript': ['typescript'],
      'CLI': ['cli', 'command'],
      'Plugins': ['plugins', 'plugin-development', 'marketplace'],
      'Upgrades': ['migration', 'upgrade', 'v4-to-v5'],
    }
  },
  cloud: {
    label: '☁️ Cloud Documentation',
    sections: {
      'Getting Started': ['deployment', 'cloud-fundamentals', 'usage-billing', 'caching'],
      'Projects Management': ['projects', 'settings', 'collaboration', 'runtime-logs', 'notifications'],
      'Deployments': ['deploys', 'deployment-history'],
      'Account Management': ['account', 'profile', 'billing'],
    }
  }
};

export const SPECIFIC_AREA_PATTERNS = {
  'media|upload|asset': { section: 'Features', area: 'Media Library' },
  'i18n|internationalization|locale|translation': { section: 'Features', area: 'Internationalization' },
  'content-manager|content manager': { section: 'Features', area: 'Content Manager' },
  'content-type-builder|content type builder': { section: 'Features', area: 'Content-Type Builder' },
  'rbac|role|permission': { section: 'Features', area: 'RBAC' },
  'review|workflow': { section: 'Features', area: 'Review Workflows' },
  'draft|publish': { section: 'Features', area: 'Draft & Publish' },
  'sso|single sign': { section: 'Features', area: 'SSO' },
  'audit log': { section: 'Features', area: 'Audit Logs' },
  'api token': { section: 'Features', area: 'API Tokens' },
  'rest|/api/rest': { section: 'APIs', area: 'REST API' },
  'graphql': { section: 'APIs', area: 'GraphQL' },
  'document service': { section: 'APIs', area: 'Document Service' },
  'database|\bdb\b': { section: 'Configurations', area: 'Database' },
  'server|middleware': { section: 'Configurations', area: 'Server' },
  'typescript|\.ts': { section: 'TypeScript', area: '' },
  'cli|command': { section: 'CLI', area: '' },
  'plugin': { section: 'Plugins', area: 'Plugin Development' },
  'migration|upgrade': { section: 'Upgrades', area: 'Migration' },
};

export const YES_PATH_PATTERNS = [
  /\b(core|server|strapi)\b/,
  /\b(plugin|plugins)\b/,
  /\badmin\b/,
  /\bcontent(-|_)manager\b/,
  /\bcontent(-|_)type(-|_)builder\b/,
  /\bi18n\b/,
  /\bupload|media\b/,
  /\bgraphql\b/,
  /\busers(-|_)permissions\b/,
  /\bapi\b/,
  /\broutes?\b/,
  /\bcontrollers?\b/,
  /\bservices?\b/,
  /(^|\/)config(\/|$)/,
];

export const FEATURE_HINTS = [
  'content-manager', 'content', 'content-type-builder', 'media-library', 'internationalization', 'i18n',
  'users-permissions', 'review-workflows', 'releases', 'upload', 'email', 'graphql', 'rest', 'admin', 'rbac', 'sso'
];

export const GENERIC_DROP_TOKENS = new Set(['src','lib','dist','build','public','docs','packages','plugin','plugins','api','server','test','tests','ci','config']);

