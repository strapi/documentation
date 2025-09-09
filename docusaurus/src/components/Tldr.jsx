import React from 'react';
import Icon from './Icon';

export function Tldr({ children, title, icon = 'sparkle', className, ...rest }) {
  return (
    <div className={`tldr ${className || ''}`} {...rest}>
      {title && (
        <div className="tldr__title">
          <Icon name={icon} classes="ph-fill" /> {title}
        </div>
      )}
      <div className="tldr__content">
        {children}
      </div>
    </div>
  );
}