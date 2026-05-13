import React from 'react'
import classNames from 'classnames';
import Link from '@docusaurus/Link';
import { useViewMode } from './ViewMode/ViewModeContext';

export default function CustomDocCard(props) {
  const { title, description, link, icon, small = false } = props;
  const { viewMode } = useViewMode();

  // Markdown mode: render as simple bullet point
  if (viewMode === 'markdown') {
    return (
      <li style={{ marginBottom: '4px', listStyle: 'disc' }}>
        <Link to={link} style={{ fontWeight: 600, fontFamily: 'var(--strapi-font-family-technical)', fontSize: '14px' }}>
          {title}
        </Link>
        {description && (
          <div style={{ fontSize: '13px', color: 'var(--strapi-neutral-600)', fontFamily: 'var(--strapi-font-family-technical)', lineHeight: '1.5', marginTop: '2px' }}>
            {description}
          </div>
        )}
      </li>
    );
  }

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
