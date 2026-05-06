import React from 'react';

export default function ThankYou({ vote }) {
  return (
    <div className="pageFeedback__thankYou" role="status">
      <span className="pageFeedback__thankYouIcon" aria-hidden="true">
        {vote === 'up' ? '\u2705' : '\u2709\uFE0F'}
      </span>
      <p className="pageFeedback__thankYouText">
        {vote === 'up'
          ? 'Thanks for your feedback!'
          : 'Thanks for letting us know. We\'ll look into it.'}
      </p>
    </div>
  );
}
