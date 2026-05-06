import React, { useState, useCallback } from 'react';
import FeedbackForm from './FeedbackForm';
import ThankYou from './ThankYou';
import { submitFeedback } from './api';
import styles from './styles.module.scss';

export default function PageFeedback({ pagePath, pageId, pageTitle }) {
  const [stage, setStage] = useState('initial'); // initial | form | submitting | done | error
  const [vote, setVote] = useState(null);

  const handleVote = useCallback((value) => {
    setVote(value);
    setStage('form');
  }, []);

  const doSubmit = useCallback(
    async (comment) => {
      setStage('submitting');
      try {
        await submitFeedback({
          kind: 'page',
          vote,
          comment: comment || undefined,
          pagePath,
          pageId,
          pageTitle,
        });
        setStage('done');
      } catch {
        setStage('error');
      }
    },
    [vote, pagePath, pageId, pageTitle],
  );

  return (
    <section className={styles.pageFeedback} aria-label="Page feedback">
      {stage === 'initial' && (
        <div className={styles.pageFeedback__prompt}>
          <span className={styles.pageFeedback__question}>
            Was this page helpful?
          </span>
          <div className={styles.pageFeedback__buttons}>
            <button
              className={styles.pageFeedback__voteButton}
              onClick={() => handleVote('up')}
              aria-label="Yes, this page was helpful"
            >
              <i className="ph ph-thumbs-up" aria-hidden="true" />
            </button>
            <button
              className={styles.pageFeedback__voteButton}
              onClick={() => handleVote('down')}
              aria-label="No, this page was not helpful"
            >
              <i className="ph ph-thumbs-down" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {stage === 'form' && (
        <FeedbackForm
          required={vote === 'down'}
          onSubmit={doSubmit}
          onCancel={() => setStage('initial')}
          isSubmitting={false}
        />
      )}

      {stage === 'submitting' && (
        <div className={styles.pageFeedback__loading} role="status">
          Sending feedback...
        </div>
      )}

      {stage === 'done' && <ThankYou vote={vote} />}

      {stage === 'error' && (
        <div className={styles.pageFeedback__error} role="alert">
          <p>Something went wrong. Please try again.</p>
          <button
            className={styles.pageFeedback__retryButton}
            onClick={() => setStage('form')}
          >
            Try again
          </button>
        </div>
      )}

      {(stage === 'initial' || stage === 'form') && (
        <p className={styles.pageFeedback__disclosure}>
          By submitting feedback, you agree we may store your comment. We don't
          collect personal information.
        </p>
      )}
    </section>
  );
}
