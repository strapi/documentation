import React from 'react'

export default function Response({
  children,
  title = 'Example response',
}) {
  return (
    <div className="api-call__response">
      <div className="api-call__response__heading">{title}</div>
      <div className="api-call__response__content">{children}</div>
    </div>
  );
}
