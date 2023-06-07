import React from 'react';
import clsx from 'clsx';
import styles from './form-field-label.module.scss';

export function FormFieldLabel({
  className,
  ...rest
}) {
  return (
    <label
      {...rest}
      className={clsx(
        styles['form-field__label'],
        className,
      )}
    />
  );
}
