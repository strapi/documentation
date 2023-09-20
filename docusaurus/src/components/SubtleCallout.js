import React from 'react';

export default function SubtleCallout({
  children,
  title,
  emoji = '🤓',
}) {
  return (
    <div className="theme-admonition theme-admonition--callout theme-admonition--subtle">
      <div className="theme-admonition__heading">
        <span style={{fontWeight: 300}} className="theme-admonition__heading__icon">{ emoji } </span>{ title }
      </div>
      { children }
    </div>
  );
}
