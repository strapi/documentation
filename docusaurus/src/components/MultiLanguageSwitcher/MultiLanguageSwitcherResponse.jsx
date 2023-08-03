import clsx from 'clsx';
import React from 'react';
import styles from './multi-language-switcher.module.scss';

export function MultiLanguageSwitcherResponse({
  children,
  title,
  ...rest
}) {
  return (
    <div
      className={clsx(
        'strapi-docs-mls__response',
        styles['strapi-docs-mls__response'],
      )}
      {...rest}
    >
      <div
        className={clsx(
          'strapi-docs-mls__response__heading',
          styles['strapi-docs-mls__response__heading'],
        )}
      >
        {title || 'Example response'}
      </div>
      <div
        className={clsx(
          'strapi-docs-mls__response__content',
          styles['strapi-docs-mls__response__content'],
        )}
      >
        {children}
      </div>
    </div>
  );
}
