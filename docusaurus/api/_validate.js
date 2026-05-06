/**
 * Validate and sanitize a feedback payload.
 * Returns { valid: true, data: {...} } or { valid: false, error: "..." }.
 */

const VALID_VOTES = ['up', 'down'];
const VALID_KINDS = ['page', 'selection', 'element'];
const MIN_COMMENT_LENGTH = 20;
const MAX_COMMENT_LENGTH = 2000;
const MAX_FIELD_LENGTH = 500;

function sanitize(str, maxLen) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
}

export function validateFeedback(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'invalid_body' };
  }

  const vote = sanitize(body.vote, 10);
  if (!VALID_VOTES.includes(vote)) {
    return { valid: false, error: 'invalid_vote' };
  }

  const kind = sanitize(body.kind, 20);
  if (!VALID_KINDS.includes(kind)) {
    return { valid: false, error: 'invalid_kind' };
  }

  const pagePath = sanitize(body.pagePath, MAX_FIELD_LENGTH);
  if (!pagePath) {
    return { valid: false, error: 'missing_page_path' };
  }

  const pageId = sanitize(body.pageId, MAX_FIELD_LENGTH);
  const pageTitle = sanitize(body.pageTitle, MAX_FIELD_LENGTH);
  const comment = sanitize(body.comment, MAX_COMMENT_LENGTH) || null;

  // Negative votes require a comment of at least MIN_COMMENT_LENGTH chars
  if (vote === 'down' && (!comment || comment.length < MIN_COMMENT_LENGTH)) {
    return { valid: false, error: 'comment_required_for_downvote' };
  }

  return {
    valid: true,
    data: { vote, kind, pagePath, pageId, pageTitle, comment },
  };
}
