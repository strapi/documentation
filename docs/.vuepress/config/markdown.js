const markdown = {
  extendMarkdown: md => {
    // use more markdown-it plugins!
    md.use(require('markdown-it-include'));
    md.use(require('markdown-it-multimd-table'), {
      multiline: true,
      rowspan: true,
      headerless: true
    });
  },
};
