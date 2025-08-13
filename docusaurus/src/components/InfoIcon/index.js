import React from 'react';
import clsx from 'clsx';

export default function InfoIcon({ tooltip, className }) {
  if (!tooltip) return null;
  
  return (
    <span className={clsx('info-icon', className)}>
      <div className="info-icon__tooltip">
        <div dangerouslySetInnerHTML={{ __html: tooltip }} />
        <div className="tooltip-arrow"></div>
      </div>
    </span>
  );
}