// Setup for the rbac scenario (rbac.yaml): brings the demo app back to the state it starts from.

const ARTICLE = 'api::article.article';
const AUTHOR = 'api::author.author';
const EXPLORER = 'plugin::content-manager.explorer';
const USER = { firstname: 'Camille', lastname: 'Doe', email: 'camille.doe@example.com' };

// Fields of the example app content types, as the role permissions list them.
const FIELDS = {
  [ARTICLE]: ['title', 'description', 'slug', 'cover', 'author', 'category', 'blocks'],
  [AUTHOR]: ['name', 'avatar', 'email', 'articles'],
};

module.exports = async function setup({ api }) {
  // The user invited by a previous capture.
  const { data: users } = await api.get('/admin/users?pageSize=100');
  const invited = users.results.filter((user) => user.email === USER.email).map((user) => user.id);
  if (invited.length) await api.post('/admin/users/batch-delete', { ids: invited });

  // The Editor role gets full access to Article (all fields and locales) and Author again,
  // as the tour removes some of it and saves.
  const { data: roles } = await api.get('/admin/roles');
  const editor = roles.find((role) => role.code === 'strapi-editor');
  const { data: current } = await api.get(`/admin/roles/${editor.id}/permissions`);
  const locales = (await api.get('/i18n/locales')).map((locale) => locale.code);
  const kept = current
    .filter((permission) => !(permission.action.startsWith(`${EXPLORER}.`) && FIELDS[permission.subject]))
    .map(({ action, subject, properties, conditions }) => ({ action, subject, properties, conditions }));
  const restored = [];
  for (const subject of [ARTICLE, AUTHOR]) {
    const localized = subject === ARTICLE;
    for (const verb of ['create', 'read', 'update', 'delete', 'publish']) {
      const properties = {};
      if (['create', 'read', 'update'].includes(verb)) properties.fields = FIELDS[subject];
      if (localized) properties.locales = locales;
      restored.push({ action: `${EXPLORER}.${verb}`, subject, properties, conditions: [] });
    }
  }
  await api.put(`/admin/roles/${editor.id}/permissions`, { permissions: [...kept, ...restored] });
};
