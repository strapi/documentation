import React, { useState, useCallback } from 'react';
import FeedbackForm from '../PageFeedback/FeedbackForm';
import { submitFeedback } from '../PageFeedback/api';
import { FEEDBACK_ENABLED } from '../PageFeedback/config';
import styles from './styles.module.scss';
// The form markup is shared with the page-level widget, and its classes live
// in the :global block of that stylesheet. Import it so the form looks exactly
// the same here as it does at the bottom of every documentation page.
import '../PageFeedback/styles.module.scss';

// General feedback is not tied to a page, so there is no vote to qualify it.
// A useful idea takes two clear sentences, hence a higher floor than the
// 20 characters the page widget asks for.
const MIN_COMMENT_LENGTH = 50;

export default function GeneralFeedback() {
  if (!FEEDBACK_ENABLED) return null;
  const [stage, setStage] = useState('initial'); // initial | form | submitting | done | error

  const doSubmit = useCallback(async (comment, hp) => {
    setStage('submitting');
    try {
      await submitFeedback({
        kind: 'suggestion',
        comment,
        pagePath: '/',
        pageId: 'homepage',
        pageTitle: 'Documentation homepage',
        _hp: hp || undefined,
      });
      setStage('done');
    } catch {
      setStage('error');
    }
  }, []);

  return (
    <section className={styles.generalFeedback} aria-label="General documentation feedback">
      {stage === 'initial' && (
        <button
          type="button"
          className={styles.generalFeedback__trigger}
          onClick={() => setStage('form')}
          aria-expanded="false"
        >
          <i className="ph ph-lightbulb" aria-hidden="true" />
          <span>Want to submit an idea to improve docs?</span>
        </button>
      )}

      {stage === 'form' && (
        <div className={styles.generalFeedback__card}>
          <FeedbackForm
            required
            minLength={MIN_COMMENT_LENGTH}
            label="Tell us what would make the docs better"
            placeholder="What would you like to see improved, added, or removed?"
            onSubmit={doSubmit}
            onCancel={() => setStage('initial')}
            isSubmitting={false}
          />
        </div>
      )}

      {stage === 'submitting' && (
        <div className={styles.generalFeedback__status} role="status">
          Sending feedback...
        </div>
      )}

      {stage === 'done' && (
        <div className={styles.generalFeedback__status} role="status">
          <i className="ph ph-check-circle" aria-hidden="true" />
          <span>Thanks for your idea. The docs team reads every submission.</span>
        </div>
      )}

      {stage === 'error' && (
        <div className={styles.generalFeedback__error} role="alert">
          <span>Something went wrong. Please try again.</span>
          <button
            type="button"
            className={styles.generalFeedback__retryButton}
            onClick={() => setStage('form')}
          >
            Try again
          </button>
        </div>
      )}
    </section>
  );
}
