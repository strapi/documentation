import React from 'react'
import classNames from 'classnames';
import Link from '@docusaurus/Link';

export default function CustomDocCard(props) {
  const { title, description, link, icon, small = false } = props;

  // Markdown mode is handled purely in CSS (view-modes.scss turns
  // .custom-doc-card into a bullet list). The component keeps the SAME markup
  // in every mode so the DOM doesn't change between SSR and hydration — which
  // is what caused a brief flash from cards to a list on generated-index pages.

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
        <Link className={linkClasses} to={link}>
          <h2 className="cardTitle" title={title}>
            {icon && <i className={`custom-doc-card__icon ph-fill ph-${icon}`}></i>} {title}
          </h2>
          {description && <p className="text--truncate cardDescription" title={ description }>
            {description}
          </p>}
        </Link>
      </article>
  );
}
