export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { indexUid } = req.query || {};
    if (!indexUid) {
      res.status(400).json({ error: 'Missing indexUid' });
      return;
    }

    // Read Meilisearch project URL and key. Fallback to values used in Docusaurus config if envs are not set.
    const host = process.env.MEILI_HOST || process.env.NEXT_PUBLIC_MEILI_HOST || 'https://ms-47f23e4f6fb9-30446.fra.meilisearch.io';
    const apiKey = process.env.MEILI_API_KEY || process.env.NEXT_PUBLIC_MEILI_API_KEY || '45326fd7e6278ec3fc83af7a5c20a2ab4261f8591bd186adf8bf8f962581622b';

    // Forward X-MS-USER-ID if present from the browser request (same-origin; no CORS issue)
    const userId = req.headers['x-ms-user-id'];

    const url = new URL(`/indexes/${encodeURIComponent(indexUid)}/search`, host);
    const upstream = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Meilisearch-Client': req.headers['x-meilisearch-client'] || 'StrapiDocs Proxy',
        ...(userId ? { 'X-MS-USER-ID': String(userId) } : {}),
      },
      body: JSON.stringify(req.body || {}),
    });

    const body = await upstream.text();
    // Pass through status and JSON body
    res.status(upstream.status);
    try {
      res.setHeader('Content-Type', 'application/json');
      res.send(body);
    } catch {
      res.json({ error: 'Invalid upstream response' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message || 'Proxy error' });
  }
}

