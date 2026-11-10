// Setup for the content-type-builder scenario (content-type-builder.yaml): brings the demo app back to the state it starts from.
// Deletes the content-type the tour creates, then waits for the server to restart.

const NEW_UID = 'api::simple-article.simple-article';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = async function setup({ api }) {
  const { data } = await api.get('/content-type-builder/content-types');
  if (!data.some((contentType) => contentType.uid === NEW_UID)) return;
  await api.del(`/content-type-builder/content-types/${NEW_UID}`);
  for (let attempt = 0; attempt < 60; attempt += 1) {
    await sleep(2000);
    try {
      const { data: status } = await api.get('/content-type-builder/update-schema-status');
      const { data: types } = await api.get('/content-type-builder/content-types');
      if (!status.isUpdating && !types.some((contentType) => contentType.uid === NEW_UID)) return;
    } catch (error) {
      // The server is still restarting.
    }
  }
  throw new Error(`${NEW_UID} still exists after deletion`);
};
