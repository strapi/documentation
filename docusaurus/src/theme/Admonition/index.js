import React from 'react';
import clsx from 'clsx';
import { ThemeClassNames } from '@docusaurus/theme-common';

const defaultClassName = ThemeClassNames.common.admonition;
const customDefaultProps = {
  note: {
    icon: '✏️',
    title: 'Note',
  },
  tip: {
    icon: '💡',
    title: 'Tip',
  },
  info: {
    icon: '👀',
    title: 'Info',
  },
  caution: {
    icon: '✋',
    title: 'Caution',
  },
  warning: {
    icon: '⚠️',
    title: 'Warning',
  },
  danger: {
    icon: '❗️',
    title: 'Warning',
  },
  strapi: {
    icon: '🤓',
  },
  prerequisites: {
    icon: '☑️',
    title: 'Prerequisites',
  },
};

export default function CustomAdmonition({
  children,
  className,
  icon: propIcon,
  title: propTitle,
  type,
  ...rest
}) {
  const { icon: defaultIcon, title: defaultTitle } = (customDefaultProps[type] || {});
  const icon = (propIcon || defaultIcon);
  const title = (propTitle || defaultTitle);
  const shouldRenderHeading = !!(icon || title);

  return (
    <div
      {...rest}
      className={clsx(
        defaultClassName,
        (type && `${defaultClassName}--${type}`),
        className,
      )}
    >
      {shouldRenderHeading && (
        <div className={`${defaultClassName}__heading`}>
          {icon && (
            <span className={`${defaultClassName}__heading__icon`}>
              {icon}{' '}
            </span>
          )}
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
