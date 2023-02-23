import React from 'react';

export default function Column({
  children,
  title = '',
  side = 'left',
}) {
  return (
    <div className={`column column--${side}`}>
      <div className="column__title">{title}</div>
      <div className="column__content">{children}</div>
    </div>
  );
}
