import React from 'react'
import classNames from 'classnames';

export default function CustomDocCard(props) {
  const { title, description, link, emoji, small = false } = props;
  const linkClasses = classNames({
    card: true,
    cardContainer: true,
    'padding--lg': !small,
    'padding--md': small,
  });
  const cardClasses = classNames({
    'custom-doc-card': true,
    'margin-bottom--lg': !small,
    'margin-bottom--sm': small,
    'custom-doc-card--small': small,
  });
  return (
      <article className={ cardClasses }>
        <a className={ linkClasses }
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
