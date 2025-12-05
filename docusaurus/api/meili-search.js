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

    const host = process.env.MEILI_HOST || process.env.NEXT_PUBLIC_MEILI_HOST || '';
    const apiKey = process.env.MEILI_API_KEY || process.env.NEXT_PUBLIC_MEILI_API_KEY || '';
    if (!host || !apiKey) {
      res.status(500).json({ error: 'Meilisearch host or API key not configured' });
      return;
    }

    const userIdFromCookie = (() => {
      try {
        const cookie = req.headers['cookie'] || '';
        const match = cookie.match(/(?:^|;\s*)msUserId=([^;]+)/);
        return match ? decodeURIComponent(match[1]) : undefined;
      } catch {
        return undefined;
      }
    })();

    const url = new URL(`/indexes/${encodeURIComponent(indexUid)}/search`, host);
    const meiliRes = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Meilisearch-Client': req.headers['x-meilisearch-client'] || 'StrapiDocs Proxy',
        ...(userIdFromCookie ? { 'X-MS-USER-ID': userIdFromCookie } : {}),
      },
      body: JSON.stringify(req.body || {}),
    });

    const data = await meiliRes.json();
    res.status(meiliRes.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Proxy error' });
  }
}

