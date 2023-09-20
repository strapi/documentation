import React from 'react';

export default function SubtleCallout({
  children,
  title,
  emoji = '🤓',
}) {
  return (
    <div
      className="theme-admonition theme-admonition--callout"
      style={{
        borderRadius: '8px',
        border: 'none',
        backgroundColor: 'transparent',
        border: 'solid 1px #8e8ea9',
        marginLeft: '80px',
      }}>
      <div className="theme-admonition__heading">
        <span style={{fontWeight: 300}} className="theme-admonition__heading__icon">{ emoji } </span>{ title }
      </div>
      { children }
    </div>
  );
}
