import React from 'react'
import classNames from 'classnames';

export default function CustomDocCard(props) {
  const { title, description, link, icon, small = false } = props;
  const linkClasses = classNames({
    card: true,
    cardContainer: true,
  });
  const cardClasses = classNames({
    'custom-doc-card': true,
    'custom-doc-card--small': small,
  });
  return (
      <article className={ cardClasses }>
        <a className={ linkClasses }
          href={ link }
        >
          <h2 className="cardTitle" title={title}>
            {icon && <i className={`custom-doc-card__icon ph-fill ph-${icon}`}></i>} {title}
          </h2>
          {description && <p className="text--truncate cardDescription" title={ description }>
            {description}
          </p>}
        </a>
      </article>
  );
}
