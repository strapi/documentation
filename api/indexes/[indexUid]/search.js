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

    // Read Meilisearch project URL and key from headers or env
    const hostHeader = req.headers['x-meili-host'];
    const keyHeader = req.headers['x-meili-api-key'];
    const host = (typeof hostHeader === 'string' && hostHeader) || process.env.MEILI_HOST || process.env.NEXT_PUBLIC_MEILI_HOST;
    const apiKey = (typeof keyHeader === 'string' && keyHeader) || process.env.MEILI_API_KEY || process.env.NEXT_PUBLIC_MEILI_API_KEY;

    if (!host || !apiKey) {
      res.status(500).json({ error: 'Meilisearch host or API key not configured' });
      return;
    }

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

