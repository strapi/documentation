import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import FeedbackForm from './FeedbackForm';
import ThankYou from './ThankYou';
import { submitFeedback } from './api';
import { FEEDBACK_ENABLED } from './config';
import styles from './styles.module.scss';

const PageFeedback = forwardRef(function PageFeedback({ pagePath, pageId, pageTitle }, ref) {
  if (!FEEDBACK_ENABLED) return null;
  const [stage, setStage] = useState('initial'); // initial | form | submitting | done | error
  const [vote, setVote] = useState(null);
  const [lastComment, setLastComment] = useState(null);
  const [selectionData, setSelectionData] = useState(null); // L2: { kind, selection }

  const handleVote = useCallback((value) => {
    setVote(value);
    setSelectionData(null);
    setStage('form');
  }, []);

  const handleSelectionFeedback = useCallback((data) => {
    setVote('down');
    setSelectionData(data);
    setStage('form');
    document.querySelector('[aria-label="Page feedback"]')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, []);

  // Expose handleSelectionFeedback to the footer wrapper via ref
  useImperativeHandle(ref, () => ({
    onSelectionFeedback: handleSelectionFeedback,
  }), [handleSelectionFeedback]);

  const doSubmit = useCallback(
    async (comment, hp) => {
      setLastComment(comment);
      setStage('submitting');
      try {
        await submitFeedback({
          kind: selectionData?.kind || 'page',
          vote,
          comment: comment || undefined,
          pagePath,
          pageId,
          pageTitle,
          selection: selectionData?.selection || undefined,
          _hp: hp || undefined,
        });
        setStage('done');
      } catch {
        setStage('error');
      }
    },
    [vote, pagePath, pageId, pageTitle, selectionData],
  );

  const handleCancel = useCallback(() => {
    setSelectionData(null);
    setStage('initial');
  }, []);

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
        <>
          {selectionData && (
            <div className={styles.pageFeedback__selectionContext}>
              <i className="ph ph-quotes" aria-hidden="true" />
              <span>
                {selectionData.selection?.text?.slice(0, 100)}
                {selectionData.selection?.text?.length > 100 ? '...' : ''}
              </span>
            </div>
          )}
          <FeedbackForm
            required={vote === 'down'}
            onSubmit={doSubmit}
            onCancel={handleCancel}
            isSubmitting={false}
          />
        </>
      )}

      {stage === 'submitting' && (
        <div className={styles.pageFeedback__loading} role="status">
          Sending feedback...
        </div>
      )}

      {stage === 'done' && (
        <ThankYou
          vote={vote}
          pagePath={pagePath}
          pageTitle={pageTitle}
          comment={lastComment}
          selectionText={selectionData?.selection?.text}
        />
      )}

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

    </section>
  );
});

export default PageFeedback;
