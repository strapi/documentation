const markdown = {
  extendMarkdown: md => {
    // use more markdown-it plugins!
    md.use(require('markdown-it-include'));
  },
};
