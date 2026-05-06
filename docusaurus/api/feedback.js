import { validateFeedback } from './_validate.js';
import { checkRateLimit } from './_rateLimit.js';
import { writeFeedbackItem } from './_notionClient.js';

const ALLOWED_ORIGIN = 'https://docs.strapi.io';

export default async function handler(req, res) {
  // Only accept POST
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Feedback-Source');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  // CORS
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);

  // Origin check (defense layer 1)
  const origin = req.headers.origin || req.headers.referer || '';
  const isLocalDev = origin.includes('localhost') || origin.includes('127.0.0.1');
  if (!isLocalDev && !origin.startsWith(ALLOWED_ORIGIN)) {
    return res.status(403).json({ error: 'forbidden_origin' });
  }

  // Custom header check (defense layer 2)
  if (req.headers['x-feedback-source'] !== 'docs-widget') {
    return res.status(403).json({ error: 'missing_source_header' });
  }

  // Rate limit (defense layer 3)
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'rate_limit_exceeded' });
  }

  // Parse body
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'invalid_json' });
  }

  // Honeypot check (defense layer 4) -- silent success to not tip off bots
  if (body._hp) {
    return res.status(200).json({ ok: true, id: 'dropped' });
  }

  // Validate payload
  const result = validateFeedback(body);
  if (!result.valid) {
    return res.status(400).json({ error: result.error });
  }

  // Write to Notion
  try {
    const { id } = await writeFeedbackItem({
      data: result.data,
      ip,
      userAgent: req.headers['user-agent'],
      country: req.headers['x-vercel-ip-country'] || '',
    });
    return res.status(200).json({ ok: true, id });
  } catch (err) {
    console.error('[feedback] Notion write failed:', err.message);
    return res.status(500).json({ error: 'internal_error' });
  }
}
