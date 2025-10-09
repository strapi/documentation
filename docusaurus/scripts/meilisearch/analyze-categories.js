const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST;
const MEILISEARCH_MASTER_KEY = process.env.MEILISEARCH_MASTER_KEY;
const INDEX_UID = process.env.MEILISEARCH_INDEX || 'strapi-docs';

require('dotenv').config();

async function analyzeCategories() {
  if (!MEILISEARCH_HOST || !MEILISEARCH_MASTER_KEY) {
    console.error('❌ Error: Missing environment variables!');
    console.log('Please set MEILISEARCH_HOST and MEILISEARCH_MASTER_KEY');
    process.exit(1);
  }

  console.log('Fetching all documents...');
  
  let allDocuments = [];
  let offset = 0;
  const limit = 1000;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `${MEILISEARCH_HOST}/indexes/${INDEX_UID}/documents?offset=${offset}&limit=${limit}&fields=url,hierarchy_lvl0`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${MEILISEARCH_MASTER_KEY}`,
        },
      }
    );

    const data = await response.json();
    
    if (data.message || data.code) {
      console.error('❌ API Error:', data.message);
      console.error('Code:', data.code);
      process.exit(1);
    }
    
    const documents = data.results || [];
    
    if (Array.isArray(documents) && documents.length > 0) {
      allDocuments = allDocuments.concat(documents);
      offset += limit;
      console.log(`Fetched ${allDocuments.length} documents so far...`);
      
      if (documents.length < limit) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  console.log(`\n📊 Total documents found: ${allDocuments.length}\n`);
  
  const categoryCounts = {};
  const urlsByCategory = {};
  
  allDocuments.forEach(hit => {
    const category = hit.hierarchy_lvl0 || 'Unknown';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    
    if (!urlsByCategory[category]) {
      urlsByCategory[category] = new Set();
    }
    if (hit.url) {
      urlsByCategory[category].add(hit.url);
    }
  });
  
  console.log('Category Statistics:\n');
  Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      console.log(`${category}: ${count} documents (${urlsByCategory[category].size} unique URLs)`);
    });
  
  console.log('\n\n❗ Pages with "Documentation" category:\n');
  if (urlsByCategory['Documentation']) {
    [...urlsByCategory['Documentation']].forEach(url => console.log(url));
  } else {
    console.log('✅ No pages with "Documentation" category found!');
  }
}

analyzeCategories().catch(error => {
  console.error('❌ Error:', error.message);
  console.error(error);
  process.exit(1);
});