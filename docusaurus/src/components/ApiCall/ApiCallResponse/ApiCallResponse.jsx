import React from 'react';
import clsx from 'clsx';

export function Response({
  children,
  className,
  title = 'Example response',
  ...rest
}) {
  return (
    <div
      className={clsx('api-call__response', className)}
      {...rest}
    >
      <div className="api-call__response__heading">{title}</div>
      <div className="api-call__response__content">{children}</div>
    </div>
  );
}
