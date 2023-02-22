import React from 'react'

export default function CustomDocCard(props) {
  const { title, description, link } = props;
  return (
      <article class="custom-doc-card col col--6 margin-bottom--lg">
        <a class="card padding--lg cardContainer"
          href={ link }
        >
          <h2 class="text--truncate cardTitle" title={title}>
            📄️ {title}
          </h2>
          <p class="text--truncate cardDescription" title={ description }>
            {description}
          </p>
        </a>
      </article>
  );
}

// TODO: make it responsive and create a wrapper component for flex or grid arrangements
