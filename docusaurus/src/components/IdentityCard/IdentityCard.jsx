import React from 'react';
import clsx from 'clsx';
import './identity-card.scss'; // Import du fichier SCSS sans l'assigner à une variable
import Icon from '../Icon';

// Card Item component for rendering each section of the identity card
export function IdentityCardItem({ 
  icon, 
  title, 
  children, 
  className,
  externalLink,
  ...rest 
}) {
  return (
    <div 
      className={clsx('identity-card__item', className)}
      {...rest}
    >
      <div className="identity-card__item-header">
        {icon && (
          <span className="identity-card__item-icon">
            <Icon name={icon} />
          </span>
        )}
        {title && (
          <span className="identity-card__item-title">
            {title}
          </span>
        )}
      </div>
      <div className="identity-card__item-content">
        {children}
        {externalLink && (
          <a 
            href={externalLink.href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="identity-card__item-link"
          >
            {externalLink.label}
            <Icon name="arrow-square-out" classes="ph-fill" />
          </a>
        )}
      </div>
    </div>
  );
}

// Main Identity Card component
export default function IdentityCard({ 
  title = 'IDENTITY CARD', 
  items = [], 
  isPlugin = false,
  className,
  children,
  ...rest 
}) {
  return (
    <div 
      className={clsx(
        'identity-card',
        isPlugin && 'identity-card--plugin',
        className
      )}
      {...rest}
    >
      {title && (
        <div className="identity-card__header">
          {title}
        </div>
      )}
      <div className="identity-card__content">
        {items.length > 0 
          ? items.map((item, index) => (
              <IdentityCardItem
                key={`identity-card-item-${index}`}
                icon={item.icon}
                title={item.title}
                externalLink={item.externalLink}
              >
                {item.content}
              </IdentityCardItem>
            ))
          : children
        }
      </div>
    </div>
  );
}