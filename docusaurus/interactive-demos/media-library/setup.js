// Setup for the media-library demo (scenario.yaml in this folder): brings the demo app back to the state it starts from.
// The 4 folders, and the seed assets in the root folder.

const path = require('path');
const FOLDERS = ['Brand assets', 'Documents', 'Events', 'Products'];

// Assets the demo app seeds, all in the root folder.
const SEED_ASSETS = [
  'daviddoe@strapi',
  'sarahbaker@strapi',
  'the-internet-s-own-boy',
  'coffee-art',
  'coffee-beans',
  'this-shrimp-is-awesome',
  'a-bug-is-becoming-a-meme-on-the-internet',
  'beautiful-picture',
  'what-s-inside-a-black-hole',
  'favicon',
  'default-image',
];

module.exports = async function setup({ api }) {
  const { results: files } = await api.get('/upload/files?pageSize=100');
  for (const file of files.filter((item) => !SEED_ASSETS.includes(item.name))) {
    await api.del(`/upload/files/${file.id}`);
  }
  // The tour moves an asset to a folder.
  const moved = files.filter((item) => SEED_ASSETS.includes(item.name) && item.folderPath !== '/');
  if (moved.length) {
    await api.post('/upload/actions/bulk-move', { destinationFolderId: null, fileIds: moved.map((item) => item.id), folderIds: [] });
  }

  const { data: folders } = await api.get('/upload/folders?pagination[pageSize]=100');
  // A top-level folder has a path like "/12".
  const isTopLevel = (folder) => folder.path.split('/').length === 2;
  const extraFolders = folders.filter((folder) => !FOLDERS.includes(folder.name) || !isTopLevel(folder));
  if (extraFolders.length) {
    await api.post('/upload/actions/bulk-delete', { fileIds: [], folderIds: extraFolders.map((folder) => folder.id) });
  }
  for (const name of FOLDERS.filter((item) => !folders.some((folder) => folder.name === item && isTopLevel(folder)))) {
    await api.post('/upload/folders', { name, parent: null });
  }
};
