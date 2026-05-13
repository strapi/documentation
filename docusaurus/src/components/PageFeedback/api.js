/**
 * Submit feedback to the n8n webhook backend.
 *
 * Returns the created feedback ID on success, or throws on failure.
 * The endpoint URL is configured once here so swapping backends
 * requires changing only this file.
 */

const FEEDBACK_ENDPOINT = 'https://n8n.tools.strapi.team/webhook/docs-feedback';

export async function submitFeedback(payload) {
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
