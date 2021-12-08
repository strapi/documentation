'use strict';

const path = require('path');
const fs = require('fs-extra');

const createConfigFile = async () => {
  const dest = path.resolve(__dirname, '..', '.vuepress', 'config');
  const sidebar = await fs.readFile(path.resolve(dest, 'sidebar.js'));
  const plugins = await fs.readFile(path.resolve(dest, 'plugins.js'));
  const metas = await fs.readFile(path.resolve(dest, 'metas.js'));
  const themeConfig = await fs.readFile(path.resolve(dest, 'theme-config.js'));
  const markdown = await fs.readFile(path.resolve(dest, 'markdown.js'));

  const content = `
${sidebar.toString()}

${plugins.toString()}

${metas.toString()};

${themeConfig.toString()}

${markdown.toString()}

module.exports = {
  ...metas,
  themeConfig,
  markdown,
  plugins,
};
  `;

  const destination = path.resolve(__dirname, '..', '.vuepress', 'config.js');

  await fs.writeFile(destination, content);
};

createConfigFile();
