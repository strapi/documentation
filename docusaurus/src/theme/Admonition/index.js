import React from 'react';
import clsx from 'clsx';
import { ThemeClassNames } from '@docusaurus/theme-common';

const defaultClassName = ThemeClassNames.common.admonition;
const customDefaultProps = {
  note: {
    icon: <i className="ph-fill ph-pencil-simple"></i>,
    title: 'Note',
  },
  tip: {
    icon: <i className="ph-fill ph-lightbulb"></i>,
    title: 'Tip',
  },
  info: {
    icon: <i className="ph-fill ph-warning-circle"></i>,
    title: 'Info',
  },
  caution: {
    icon: <i className="ph-fill ph-hand-palm"></i>,
    title: 'Caution',
  },
  warning: {
    icon: <i className="ph-fill ph-hand-palm"></i>,
    title: 'Warning',
  },
  danger: {
    icon: <i className="ph-fill ph-warning-circle"></i>,
    title: 'Warning',
  },
  strapi: {
    icon: <i className="ph-fill ph-warning-circle"></i>,
  },
  prerequisites: {
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
