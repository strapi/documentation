import React from 'react';

function buildGitHubIssueUrl({ pagePath, pageTitle, comment }) {
  const title = `[Doc feedback] ${pageTitle}`;
  const body = [
    `**Page:** [${pageTitle}](https://docs.strapi.io${pagePath})`,
    '',
    '**Feedback:**',
    comment,
    '',
    '<!-- This issue was opened from the docs feedback widget -->',
  ].join('\n');

  const params = new URLSearchParams({
    template: 'doc-feedback.yml',
    title,
    body,
    labels: 'feedback: from-docs-widget',
  });

  return `https://github.com/strapi/documentation/issues/new?${params.toString()}`;
}

export default function ThankYou({ vote, pagePath, pageTitle, comment }) {
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
      {vote === 'down' && comment && (
        <a
          className="pageFeedback__issueLink"
          href={buildGitHubIssueUrl({ pagePath, pageTitle, comment })}
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="ph ph-github-logo" aria-hidden="true" />
          {' '}Create a GitHub issue
        </a>
      )}
    </div>
  );
}
