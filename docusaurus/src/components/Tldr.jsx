import React from 'react';
import Icon from './Icon';

export function Tldr({ children, title = 'Page summary', icon = 'newspaper-clipping', className, ...rest }) {
  return (
    <blockquote className={`tldr ${className || ''}`} {...rest}>
      <div className="tldr__body">
        <Icon name={icon} classes="ph-fill" /> <strong>{title}:</strong>
        <br />
        {children}
      </div>
    </blockquote>
  );
}