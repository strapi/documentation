'use strict';

const path = require('path');
const fs = require('fs-extra');

const createConfigFile = async () => {
  const dest = path.resolve(__dirname, '..', '.vuepress', 'config');
  const userSidebar = await fs.readFile(path.resolve(dest, 'sidebar-user.js'));
  const plugins = await fs.readFile(path.resolve(dest, 'plugins.js'));
  const metas = await fs.readFile(path.resolve(dest, 'metas.js'));
  const themeConfig = await fs.readFile(path.resolve(dest, 'theme-config.js'));
  const markdown = await fs.readFile(path.resolve(dest, 'markdown.js'));
  const patterns = await fs.readFile(path.resolve(dest, 'patterns-user.js'));

  const content = `
${userSidebar.toString()}

const sidebar = {
  user,
};

${plugins.toString()}

${metas.toString()};

${themeConfig.toString()}

${markdown.toString()}

${patterns.toString()}


module.exports = {
  ...metas,
  themeConfig,
  markdown,
  plugins,
  patterns
};
  `;

  const destination = path.resolve(__dirname, '..', '.vuepress', 'config.js');

  await fs.writeFile(destination, content);
};

createConfigFile();
