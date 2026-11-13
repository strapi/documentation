// Setup for the admin-panel demo (scenario.yaml in this folder): brings the demo app back to the state it starts from.

module.exports = async function setup({ api }) {
  // The tour saves French as the interface language: the next capture must start in English.
  // The dark mode it saves lives in the browser only, and every capture starts a new browser.
  await api.put('/admin/users/me', { preferedLanguage: null });
};
