const { MeiliSearch } = require('meilisearch');
const fs = require('fs');
const path = require('path');

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST,
  apiKey: process.env.MEILISEARCH_MASTER_KEY
});

const configPath = path.join(__dirname, 'category-order-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

function getCategoryOrder(category) {
  const cmsOrder = config.cms[category];
  const cloudOrder = config.cloud[category];
  
  if (cmsOrder !== undefined) return cmsOrder;
  if (cloudOrder !== undefined) return cloudOrder;
  
  return config.default;
}

async function addCategoryOrder() {
  if (!process.env.MEILISEARCH_HOST || !process.env.MEILISEARCH_MASTER_KEY) {
    console.error('Error: Missing environment variables');
    console.error('Make sure MEILISEARCH_HOST and MEILISEARCH_MASTER_KEY are defined');
    process.exit(1);
  }

  const index = client.index('strapi-docs');
  
  console.log('Fetching documents...');
  
  let offset = 0;
  const limit = 1000;
  let hasMore = true;
  let totalUpdated = 0;
  
  while (hasMore) {
    const results = await index.getDocuments({
      offset,
      limit
    });
    
    if (results.results.length === 0) {
      hasMore = false;
      break;
    }
    
    const documentsToUpdate = results.results.map(doc => {
      const category = doc.hierarchy_lvl0 || 'Documentation';
      const categoryOrder = getCategoryOrder(category);
      
      return {
        ...doc,
        category_order: categoryOrder
      };
    });
    
    await index.updateDocuments(documentsToUpdate);
    
    totalUpdated += documentsToUpdate.length;
    console.log(`Updated: ${documentsToUpdate.length} documents (total: ${totalUpdated})`);
    
    offset += limit;
  }
  
  console.log('\nUpdating ranking rules...');
  await index.updateRankingRules([
    'words',
    'exactness',
    'attribute',
    'category_order:asc',
    'proximity',
    'typo',
    'sort'
  ]);
  
  console.log('\nDone! You can now test your search.');
}

addCategoryOrder().catch(console.error);