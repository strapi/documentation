import React from 'react'

export default function Request({
  children,
  title = 'Example request',
}) {
  return (
    <div className="api-call__request">
      <div className="api-call__request__heading">{title}</div>
      <div className="api-call__request__content">{children}</div>
    </div>
  );
}
