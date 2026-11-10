// Setup for the review-workflows demo (scenario.yaml in this folder): brings the demo app back to the state it starts from.
// Only the Default workflow, with its 4 stages, no role restriction, no required stage and no
// content type, and no assignee on any article.

const ARTICLE = 'api::article.article';

// Entries the Content Manager tour may leave behind in a shared demo app.
const EXTRA_TITLES = ['How I wrote my first article with Strapi', "Comment j'ai créé mon premier article avec Strapi"];
const DEFAULT_STAGES = [
  { name: 'To do', color: '#4945FF' },
  { name: 'Ready to review', color: '#9736E8' },
  { name: 'In progress', color: '#EE5E52' },
  { name: 'Reviewed', color: '#328048' },
];

module.exports = async function setup({ api }) {
  const { data: workflows } = await api.get('/review-workflows/workflows?populate=stages');
  for (const workflow of workflows.filter((item) => item.name !== 'Default')) {
    await api.del(`/review-workflows/workflows/${workflow.id}`);
  }
  let workflow = workflows.find((item) => item.name === 'Default');
  if (!workflow) {
    ({ data: workflow } = await api.post('/review-workflows/workflows', { data: { name: 'Default', stages: DEFAULT_STAGES } }));
  }

  // Assignees can only be changed while Article uses a workflow.
  if (!workflow.contentTypes.includes(ARTICLE)) {
    await api.put(`/review-workflows/workflows/${workflow.id}`, { data: { contentTypes: [ARTICLE] } });
  }
  for (const locale of ['en', 'fr']) {
    const { results } = await api.get(`/content-manager/collection-types/${ARTICLE}?pageSize=100&locale=${locale}`);
    for (const entry of results) {
      if (EXTRA_TITLES.includes(entry.title)) {
        await api.del(`/content-manager/collection-types/${ARTICLE}/${entry.documentId}?locale=${locale}`);
      } else if (entry.strapi_assignee) {
        await api.put(`/review-workflows/content-manager/collection-types/${ARTICLE}/${entry.documentId}/assignee?locale=${locale}`, { data: { id: null } });
      }
    }
  }

  // Unassigning Article also drops the stage of every entry: they all start at "To do" again.
  const stages = DEFAULT_STAGES.map((stage) => ({
    ...stage,
    id: workflow.stages.find((existing) => existing.name === stage.name)?.id,
    fromPermissions: [],
    toPermissions: [],
  }));
  await api.put(`/review-workflows/workflows/${workflow.id}`, {
    data: { name: 'Default', stages, contentTypes: [], stageRequiredToPublishName: null },
  });

  const { data } = await api.get(`/content-manager/content-types/${ARTICLE}/configuration`);
  const { layouts, metadatas, settings } = data.contentType;
  // GET returns a computed `list.mainField` that PUT rejects.
  for (const field of Object.values(metadatas)) delete field.list?.mainField;
  await api.put(`/content-manager/content-types/${ARTICLE}/configuration`, {
    layouts: { ...layouts, list: ['id', 'title'] },
    metadatas,
    settings,
  });
};
