import clsx from 'clsx';
import React from 'react';
import styles from './multi-language-switcher.module.scss';

export function MultiLanguageSwitcherRequest({
  children,
  language,
  title,
  ...rest
}) {
  return (
    <div
      data-language={language}
      className={clsx(
        'strapi-docs-mls__request',
        styles['strapi-docs-mls__request'],
      )}
      {...rest}
    >
      <div
        className={clsx(
          'strapi-docs-mls__request__heading',
          styles['strapi-docs-mls__request__heading'],
        )}
      >
        {title || `Example ${language} request`}
      </div>
      <div
        className={clsx(
          'strapi-docs-mls__request__content',
          'api-call__request__content',
          styles['strapi-docs-mls__request__content'],
        )}
      >
        {children}
      </div>
    </div>
  );
}
