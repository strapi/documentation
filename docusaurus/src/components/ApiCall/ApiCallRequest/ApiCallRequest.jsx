import React from 'react';
import clsx from 'clsx';

export function Request({
  children,
  className,
  title = 'Example request',
  ...rest
}) {
  return (
    <div
      className={clsx('api-call__request', className)}
      {...rest}
    >
      <div className="api-call__request__heading">
        {title}
      </div>
      <div className="api-call__request__content">
        {children}
      </div>
    </div>
  );
}
