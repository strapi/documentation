import React from 'react';

export default function ThankYou({ vote }) {
  return (
    <div className="pageFeedback__thankYou" role="status">
      <i
        className={vote === 'up' ? 'ph ph-check-circle' : 'ph ph-envelope'}
        aria-hidden="true"
        style={vote === 'up' ? { color: 'var(--ifm-color-success, #00a854)' } : undefined}
      />
      <p className="pageFeedback__thankYouText">
        {vote === 'up'
          ? 'Thanks for your feedback!'
          : 'Thanks for letting us know. We\'ll look into it.'}
      </p>
    </div>
  );
}
