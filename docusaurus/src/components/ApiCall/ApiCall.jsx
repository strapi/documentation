import React from 'react';
import clsx from 'clsx';

export function ApiCall({
  children,
  className,
  ...rest
}) {
  return (
    <div
      className={clsx('api-call', className)}
      {...rest}
    />
  );
}
