import React from 'react';
import clsx from 'clsx';
import styles from './container.module.scss';

export function Container({ className, ...rest }) {
  return (
    <div
      className={clsx(
        styles.container,
        className,
      )}
      {...rest}
    />
  );
}
