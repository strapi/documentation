import React from 'react'

export default function EnterpriseBadge(props) {
  const { link = "http:///strapi.io/pricing-self-hosted", noLink = false } = props;

  return (
    <span className="badge badge--pricing badge--gold">
      { noLink
        ? 'Enterprise'
        : <a className="badge-link" href={ link }>Enterprise</a>
      }
    </span>
  );
}
