import React, { useState } from 'react';

const MIN_COMMENT_LENGTH = 20;
const MAX_COMMENT_LENGTH = 2000;

export default function FeedbackForm({
  onSubmit,
  onCancel,
  isSubmitting,
  required,
}) {
  const [comment, setComment] = useState('');

  const trimmed = comment.trim();
  const isTooLong = trimmed.length > MAX_COMMENT_LENGTH;
  const canSubmit = required
    ? trimmed.length >= MIN_COMMENT_LENGTH && !isTooLong && !isSubmitting
    : !isTooLong && !isSubmitting;

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit(trimmed || null);
  }

  return (
    <form onSubmit={handleSubmit} className="pageFeedback__form">
      <label htmlFor="feedback-comment" className="pageFeedback__formLabel">
        {required ? 'Please tell us more' : 'Want to add a comment? (optional)'}
      </label>
      <textarea
        id="feedback-comment"
        className="pageFeedback__textarea"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={
          required
            ? 'What was missing or confusing?'
            : 'What did you find helpful?'
        }
        rows={3}
        maxLength={MAX_COMMENT_LENGTH}
        disabled={isSubmitting}
        autoFocus
      />
      {/* Honeypot -- hidden from real users, bots fill it in */}
      <input
        type="text"
        name="_hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px' }}
      />
      <div className="pageFeedback__formActions">
        <span className="pageFeedback__charCount">
          {required && trimmed.length < MIN_COMMENT_LENGTH
            ? `At least ${MIN_COMMENT_LENGTH - trimmed.length} more character${MIN_COMMENT_LENGTH - trimmed.length === 1 ? '' : 's'}`
            : `${trimmed.length} / ${MAX_COMMENT_LENGTH}`}
        </span>
        <div className="pageFeedback__formButtons">
          <button
            type="button"
            className="pageFeedback__cancelButton"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="pageFeedback__submitButton"
            disabled={!canSubmit}
          >
            {isSubmitting ? 'Sending...' : 'Submit'}
          </button>
        </div>
      </div>
    </form>
  );
}
