// Setup for the documentation scenario (documentation.yaml): brings the demo app back to the state it starts from.
// The tour changes nothing on the server: Swagger UI only expands sections and opens the
// authorization dialog in the browser. Fails early if the plugin is missing.

module.exports = async function setup({ api }) {
  await api.get('/documentation/getInfos');
};
