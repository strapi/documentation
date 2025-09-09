import React from 'react';
import Icon from './Icon';

export function Tldr({ children, title, icon = 'sparkle', design = 'default', className, ...rest }) {
  const designClass = design !== 'default' ? `tldr--${design}` : '';
  
  return (
    <div className={`tldr ${designClass} ${className || ''}`} {...rest}>
      {title && (
        <div className="tldr__title">
          <Icon name={icon} /> {title}
        </div>
      )}
      <div className="tldr__content">
        {children}
      </div>
    </div>
  );
}