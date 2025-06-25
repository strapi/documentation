import React from 'react';
import clsx from 'clsx';

export default function InfoIcon({ tooltip, className }) {
  if (!tooltip) return null;
  
  return (
    <span className={clsx('info-icon', className)}>
      <i className="ph-fill ph-info info-icon__icon"></i>
      <div className="info-icon__tooltip">
        <div dangerouslySetInnerHTML={{ __html: tooltip }} />
        <div className="tooltip-arrow"></div>
      </div>
    </span>
  );
}