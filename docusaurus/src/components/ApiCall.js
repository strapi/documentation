import React from 'react'
import clsx from 'clsx'

export default function ApiCall({
  children,
  noSideBySide = false,
}) {
  return (
    <div
      className={clsx(
        'api-call',
        (noSideBySide && 'api-call--no-side-by-side'),
      )}
    >
      {children}
    </div>
  );
}
