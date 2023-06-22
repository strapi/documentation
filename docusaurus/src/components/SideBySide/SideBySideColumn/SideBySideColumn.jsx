import React from 'react';
import clsx from 'clsx';
import styles from './side-by-side-column.module.scss';

export function SideBySideColumn({ children, className, ...rest }) {
  return (
    <div
      className={clsx(
        styles['sbs-column'],
        className,
      )}
      {...rest}
    >
      <div
        className={clsx(
          styles['sbs-column__content'],
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
