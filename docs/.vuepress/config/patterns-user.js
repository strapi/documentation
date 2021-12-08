const patterns = [
  '**/*.md',
  '!**/developer-docs/**/*.md',
  // We import the homepage of the documentation from the developer documentation,
  // without this when launching the doc it redirects to the 404 page.
  '**/developer-docs/latest/getting-started/introduction.md',
  '!node_modules',
];
