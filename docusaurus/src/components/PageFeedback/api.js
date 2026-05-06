/**
 * Submit feedback to the backend.
 *
 * Returns the created feedback ID on success, or throws on failure.
 * The endpoint URL is configured once here so swapping backends
 * (Vercel Function, n8n, etc.) requires changing only this file.
 */

const FEEDBACK_ENDPOINT = '/api/feedback';

export async function submitFeedback(payload) {
  // Local development: log and return a fake ID.
  // This allows testing the widget UI without a running backend.
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('[PageFeedback] Stub mode -- payload:', payload);
    return `stub-${Date.now()}`;
  }

  const response = await fetch(FEEDBACK_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Feedback-Source': 'docs-widget',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Feedback submission failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.id;
}
