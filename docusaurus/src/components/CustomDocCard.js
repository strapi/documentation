import React from 'react'

export default function CustomDocCard(props) {
  const { title, description, link, emoji } = props;
  return (
      <article className="custom-doc-card margin-bottom--lg">
        <a className="card padding--lg cardContainer"
          href={ link }
        >
          <h2 className="text--truncate cardTitle" title={title}>
            {emoji ? emoji : '📄️'} {title}
          </h2>
          <p className="text--truncate cardDescription" title={ description }>
            {description}
          </p>
        </a>
      </article>
  );
}

// TODO: make it responsive and create a wrapper component for flex or grid arrangements
