const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST;
const MEILISEARCH_KEY = process.env.MEILISEARCH_KEY;
const INDEX_UID = process.env.MEILISEARCH_INDEX || 'strapi-docs';

async function analyzeCategories() {
  if (!MEILISEARCH_HOST || !MEILISEARCH_KEY) {
    console.error('❌ Error: Missing environment variables!');
    console.log('Please set MEILISEARCH_HOST and MEILISEARCH_KEY');
    console.log('\nExample:');
    console.log('  MEILISEARCH_HOST=https://your-instance.meilisearch.io \\');
    console.log('  MEILISEARCH_KEY=your-api-key \\');
    console.log('  node analyze-categories.js');
    process.exit(1);
  }

  const response = await fetch(`${MEILISEARCH_HOST}/indexes/${INDEX_UID}/search`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MEILISEARCH_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: '',
      limit: 20000,
      attributesToRetrieve: ['url', 'hierarchy_lvl0']
    })
  });

  const data = await response.json();
  
  console.log(`\n📊 Total documents found: ${data.hits.length} / ${data.estimatedTotalHits || 'unknown'}\n`);
  
  const categoryCounts = {};
  const urlsByCategory = {};
  
  data.hits.forEach(hit => {
    const category = hit.hierarchy_lvl0 || 'Unknown';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    
    if (!urlsByCategory[category]) {
      urlsByCategory[category] = new Set();
    }
    urlsByCategory[category].add(hit.url);
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
  process.exit(1);
});