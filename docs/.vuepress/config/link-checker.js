const checklinksIgnoredFiles = [
  '**/node_modules', // please never remove this one
  /**
   * Caution: Adding an individual file to this section
   * will prevent the _whole_ file from being scanned for broken links.
   *
   * Currently, there is no easy way to ignore a specific link inside a file.
   */

  /**
   * Files below give false positives
   */
  '/developer-docs/latest/developer-resources/plugin-api-reference/admin-panel.md',
  './developer-docs/latest/development/backend-customization/models.md',
  './developer-docs/latest/guides/count-graphql.md', // might be removed once GraphQL customization is ready
  './developer-docs/latest/setup-deployment-guides/configurations.md', // the script thinks filename[]() at line 977 is a real link
  './developer-docs/latest/development/backend-customization/webhooks.md', // 'missing" links are in commented part of file
];
